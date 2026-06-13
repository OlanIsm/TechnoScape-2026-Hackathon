import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order, CollectivePool, AuditLog, OrderStatus, PoolStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // Create Order
  async createOrder(data: Prisma.OrderUncheckedCreateInput): Promise<Order> {
    const order = await this.prisma.order.create({
      data: {
        totalPrice: data.totalPrice,
        status: OrderStatus.PENDING,
        koperasi: { connect: { id: data.koperasiId } },
        collectivePool: data.collectivePoolId ? { connect: { id: data.collectivePoolId } } : undefined,
        orderItems: {
          create: data.orderItems as any,
        },
      },
      include: { orderItems: true },
    });

    // Write Audit Log
    await this.writeAuditLog(
      'CREATE_ORDER',
      JSON.stringify({ orderId: order.id, totalPrice: order.totalPrice }),
      undefined
    );

    return order;
  }

  // Confirm Order (Immutable Ledger Rule: cannot modify once CONFIRMED)
  async confirmOrder(orderId: string, userId?: string): Promise<Order> {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new BadRequestException('Order tidak ditemukan');
    }

    if (existingOrder.status === OrderStatus.CONFIRMED) {
      throw new BadRequestException('Order sudah berstatus CONFIRMED dan tidak dapat diubah (Immutable Ledger)');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CONFIRMED },
    });

    // Write Audit Log
    await this.writeAuditLog(
      'CONFIRM_ORDER',
      JSON.stringify({ orderId, statusBefore: existingOrder.status, statusAfter: OrderStatus.CONFIRMED }),
      userId
    );

    return updatedOrder;
  }

  // Collective Pool CRUD
  async createPool(data: Prisma.CollectivePoolUncheckedCreateInput): Promise<CollectivePool> {
    return this.prisma.collectivePool.create({
      data: {
        name: data.name,
        deadline: data.deadline,
        status: PoolStatus.ACTIVE,
        product: { connect: { id: data.productId } },
      },
    });
  }

  // Get active pools with products and current aggregated orders
  async findAllActivePools(): Promise<any[]> {
    return this.prisma.collectivePool.findMany({
      where: { status: PoolStatus.ACTIVE },
      include: {
        product: { include: { supplier: true } },
        orders: { include: { orderItems: true } },
      },
    });
  }

  // Join pool: Associate order with a pool and calculate new volume/prices
  async joinPool(poolId: string, orderId: string, userId?: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Order tidak ditemukan');
    }

    if (order.status === OrderStatus.CONFIRMED) {
      throw new BadRequestException('Tidak bisa bergabung ke pool karena order sudah dikonfirmasi (CONFIRMED)');
    }

    const pool = await this.prisma.collectivePool.findUnique({
      where: { id: poolId },
    });

    if (!pool || pool.status !== PoolStatus.ACTIVE) {
      throw new BadRequestException('Pool tidak aktif atau tidak ditemukan');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { collectivePoolId: poolId },
    });

    // Write Audit Log
    await this.writeAuditLog(
      'JOIN_POOL',
      JSON.stringify({ orderId, poolId }),
      userId
    );

    return updatedOrder;
  }

  // Audit Log writer helper
  async writeAuditLog(action: string, details: string, userId?: string): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        action,
        details,
        userId: userId || undefined,
      },
    });
  }

  // Get all audit logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  // Export orders to CSV string
  async exportOrdersToCsv(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { koperasi: true },
    });

    if (!user || !user.koperasiId) {
      return 'Order ID,Tanggal Transaksi,Nama Produk,Kuantitas (kg),Harga Satuan (Rp/kg),Total Harga (Rp),Status,Nama Pool Patungan\n';
    }

    const orders = await this.prisma.order.findMany({
      where: { koperasiId: user.koperasiId },
      include: {
        orderItems: {
          include: { product: true },
        },
        collectivePool: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let csv = 'Order ID,Tanggal Transaksi,Nama Produk,Kuantitas (kg),Harga Satuan (Rp/kg),Total Harga (Rp),Status,Nama Pool Patungan\n';

    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      const statusStr = order.status;
      const poolName = order.collectivePool ? order.collectivePool.name : '-';

      for (const item of order.orderItems) {
        const productName = item.product.name;
        const quantity = item.quantity;
        const pricePerKg = item.priceAtPurchase;
        const totalItemPrice = quantity * pricePerKg;

        const escapedProductName = productName.replace(/"/g, '""');
        const escapedPoolName = poolName.replace(/"/g, '""');

        csv += `"${order.id}","${dateStr}","${escapedProductName}",${quantity},${pricePerKg},${totalItemPrice},"${statusStr}","${escapedPoolName}"\n`;
      }
    }

    return csv;
  }
}
