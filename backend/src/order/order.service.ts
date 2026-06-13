import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Order,
  CollectivePool,
  AuditLog,
  OrderStatus,
  PoolStatus,
  Prisma,
} from '@prisma/client';

const FERTILIZER_CATALOG: Record<
  string,
  { name: string; aliases: string[]; pricePerKg: number }
> = {
  urea: { name: 'Urea', aliases: ['urea'], pricePerKg: 8500 },
  npk: { name: 'NPK', aliases: ['npk', 'phonska'], pricePerKg: 10000 },
  sp36: { name: 'SP-36', aliases: ['sp-36', 'sp36'], pricePerKg: 9000 },
  za: { name: 'ZA', aliases: ['za'], pricePerKg: 7500 },
  organik: {
    name: 'Organik',
    aliases: ['organik', 'organic'],
    pricePerKg: 4500,
  },
};

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  private getFertilizerCatalogEntry(jenisPupuk: string) {
    const normalized = (jenisPupuk || '').toLowerCase();
    return (
      Object.values(FERTILIZER_CATALOG).find((entry) => {
        return entry.aliases.some((alias) => normalized.includes(alias));
      }) ?? FERTILIZER_CATALOG.npk
    );
  }

  private async findOrCreateSupplier(name?: string) {
    const supplierName = name?.trim() || 'Supplier Default VolumeMate';
    let supplier = await this.prisma.supplier.findFirst({
      where: {
        name: { contains: supplierName, mode: 'insensitive' },
      },
    });

    if (!supplier) {
      supplier = await this.prisma.supplier.create({
        data: {
          name: supplierName,
          address: 'Alamat Supplier Manual',
          phone: '08123456789',
        },
      });
    }

    return supplier;
  }

  private async findOrCreateProduct(jenisPupuk: string, supplierName?: string) {
    const entry = this.getFertilizerCatalogEntry(jenisPupuk);
    const searchTerms = Array.from(
      new Set([entry.name, ...entry.aliases, jenisPupuk].filter(Boolean)),
    );

    let product = await this.prisma.product.findFirst({
      where: {
        OR: searchTerms.map((term) => ({
          name: { contains: term, mode: 'insensitive' as const },
        })),
      },
    });

    if (product) {
      return product;
    }

    const supplier = await this.findOrCreateSupplier(supplierName);
    product = await this.prisma.product.create({
      data: {
        name: entry.name,
        description: `Produk default ${entry.name} untuk pencatatan transaksi VolumeMate.`,
        supplierId: supplier.id,
        priceTiers: {
          create: [
            {
              minVolume: 0,
              maxVolume: null,
              pricePerKg: entry.pricePerKg,
            },
          ],
        },
      },
    });

    return product;
  }

  // Create Order
  async createOrder(data: Prisma.OrderUncheckedCreateInput): Promise<Order> {
    const order = await this.prisma.order.create({
      data: {
        totalPrice: data.totalPrice,
        status: OrderStatus.PENDING,
        koperasi: { connect: { id: data.koperasiId } },
        collectivePool: data.collectivePoolId
          ? { connect: { id: data.collectivePoolId } }
          : undefined,
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
      undefined,
    );

    return order;
  }

  async createManualTransaction(
    userId: string,
    jenisPupuk: string,
    quantity: number,
    supplierName: string,
    tanggal: string,
    totalPrice: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(
        'Sesi Anda telah kedaluwarsa atau User tidak ditemukan. Silakan log out dan masuk kembali.',
      );
    }

    if (!user.koperasiId) {
      throw new BadRequestException(
        'User Anda tidak terasosiasi dengan Koperasi mana pun di sistem.',
      );
    }

    // Cari atau buat supplier
    await this.findOrCreateSupplier(supplierName);
    const product = await this.findOrCreateProduct(jenisPupuk, supplierName);

    const priceAtPurchase = totalPrice / quantity;

    // Simpan order manual dengan status DELIVERED
    const parsedDate = new Date(tanggal);
    const orderDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    const order = await this.prisma.order.create({
      data: {
        totalPrice,
        status: OrderStatus.DELIVERED,
        koperasiId: user.koperasiId,
        createdAt: orderDate,
        orderItems: {
          create: [
            {
              quantity,
              priceAtPurchase,
              productId: product.id,
            },
          ],
        },
      },
      include: { orderItems: true },
    });

    await this.writeAuditLog(
      'MANUAL_TRANSACTION',
      JSON.stringify({
        orderId: order.id,
        jenisPupuk,
        quantity,
        supplierName,
        totalPrice,
      }),
      userId,
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
      throw new BadRequestException(
        'Order sudah berstatus CONFIRMED dan tidak dapat diubah (Immutable Ledger)',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CONFIRMED },
    });

    // Write Audit Log
    await this.writeAuditLog(
      'CONFIRM_ORDER',
      JSON.stringify({
        orderId,
        statusBefore: existingOrder.status,
        statusAfter: OrderStatus.CONFIRMED,
      }),
      userId,
    );

    return updatedOrder;
  }

  // Get all products with supplier + price tiers
  async findAllProducts() {
    return this.prisma.product.findMany({
      include: { supplier: true, priceTiers: true },
    });
  }

  // Collective Pool CRUD
  async createPool(
    data: Prisma.CollectivePoolUncheckedCreateInput,
  ): Promise<CollectivePool> {
    // Verify product exists first
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product) {
      throw new BadRequestException(
        `Produk dengan ID '${data.productId}' tidak ditemukan.`,
      );
    }
    return this.prisma.collectivePool.create({
      data: {
        name: data.name,
        deadline: data.deadline,
        status: PoolStatus.ACTIVE,
        productId: data.productId,
      },
    });
  }

  // Get active pools with products and current aggregated orders
  async findAllActivePools(): Promise<any[]> {
    return this.prisma.collectivePool.findMany({
      where: { status: PoolStatus.ACTIVE },
      include: {
        product: { include: { supplier: true, priceTiers: true } },
        orders: { include: { orderItems: true } },
      },
    });
  }

  // Join pool: Associate order with a pool and calculate new volume/prices
  async joinPool(
    poolId: string,
    orderId: string,
    userId?: string,
  ): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new BadRequestException('Order tidak ditemukan');
    }

    if (order.status === OrderStatus.CONFIRMED) {
      throw new BadRequestException(
        'Tidak bisa bergabung ke pool karena order sudah dikonfirmasi (CONFIRMED)',
      );
    }

    const pool = await this.prisma.collectivePool.findUnique({
      where: { id: poolId },
      include: {
        product: { include: { priceTiers: true } },
        orders: { include: { orderItems: true } },
      },
    });

    if (!pool || pool.status !== PoolStatus.ACTIVE) {
      throw new BadRequestException('Pool tidak aktif atau tidak ditemukan');
    }

    // Hubungkan order ke pool
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { collectivePoolId: poolId },
      include: { orderItems: true },
    });

    // Rekalkulasi total volume di dalam pool
    const allOrders = await this.prisma.order.findMany({
      where: { collectivePoolId: poolId },
      include: { orderItems: true },
    });

    let totalVolumeKg = 0;
    for (const ord of allOrders) {
      for (const item of ord.orderItems) {
        totalVolumeKg += item.quantity;
      }
    }

    // Cari price tier yang sesuai
    const sortedTiers = pool.product.priceTiers.sort(
      (a, b) => b.minVolume - a.minVolume,
    );
    let activePricePerKg = pool.product.priceTiers[0]?.pricePerKg || 9000;

    for (const tier of sortedTiers) {
      if (totalVolumeKg >= tier.minVolume) {
        activePricePerKg = tier.pricePerKg;
        break;
      }
    }

    // Perbarui harga item pembelian untuk semua anggota pool
    for (const ord of allOrders) {
      let updatedTotalOrderPrice = 0;
      for (const item of ord.orderItems) {
        const itemQuantity = item.quantity;
        const newPrice = activePricePerKg;

        await this.prisma.orderItem.update({
          where: { id: item.id },
          data: {
            priceAtPurchase: newPrice,
          },
        });

        updatedTotalOrderPrice += itemQuantity * newPrice;
      }

      await this.prisma.order.update({
        where: { id: ord.id },
        data: {
          totalPrice: updatedTotalOrderPrice,
        },
      });
    }

    // Catat log audit
    await this.writeAuditLog(
      'JOIN_POOL',
      JSON.stringify({
        orderId,
        poolId,
        totalVolumeKg,
        activePricePerKg,
      }),
      userId,
    );

    return updatedOrder;
  }

  // Finalize Pool (Deadline handling with Grace Period or fallback pricing)
  async finalizePool(poolId: string): Promise<any> {
    const pool = await this.prisma.collectivePool.findUnique({
      where: { id: poolId },
      include: {
        product: { include: { priceTiers: true } },
        orders: { include: { orderItems: true } },
      },
    });

    if (!pool) {
      throw new BadRequestException('Pool tidak ditemukan');
    }

    // Hitung total volume terkumpul
    let totalVolumeKg = 0;
    for (const ord of pool.orders) {
      for (const item of ord.orderItems) {
        totalVolumeKg += item.quantity;
      }
    }

    // Tentukan threshold sukses pool (misalnya 10 Ton)
    const minTargetVolume = 10000;

    if (totalVolumeKg >= minTargetVolume) {
      // Sukses: Ubah status pool ke COMPLETED
      const updatedPool = await this.prisma.collectivePool.update({
        where: { id: poolId },
        data: { status: PoolStatus.COMPLETED },
      });

      await this.writeAuditLog(
        'FINALIZE_POOL_SUCCESS',
        JSON.stringify({ poolId, totalVolumeKg, status: 'COMPLETED' }),
      );

      return {
        success: true,
        message: 'Pool berhasil mengumpulkan kuota target dan diselesaikan.',
        pool: updatedPool,
      };
    } else {
      // Fallback/Grace Period Mechanism:
      // Perpanjang deadline pool selama 2 hari sebagai toleransi
      const newDeadline = new Date();
      newDeadline.setDate(newDeadline.getDate() + 2);

      const updatedPool = await this.prisma.collectivePool.update({
        where: { id: poolId },
        data: {
          deadline: newDeadline,
          // Tetap ACTIVE agar bisa menerima partisipan baru
        },
      });

      await this.writeAuditLog(
        'FINALIZE_POOL_FALLBACK_GRACE',
        JSON.stringify({
          poolId,
          totalVolumeKg,
          extendedDeadline: newDeadline,
        }),
      );

      return {
        success: false,
        message:
          'Volume target tidak tercapai. Grace period aktif: pool diperpanjang 2 hari.',
        pool: updatedPool,
      };
    }
  }

  async createDistribution(
    userId: string,
    jenisPupuk: string,
    quantity: number,
    buyerName: string,
    tanggal: string,
    pricePerKg: number,
    notes?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(
        'Sesi Anda telah kedaluwarsa atau User tidak ditemukan. Silakan log out dan masuk kembali.',
      );
    }

    if (!user.koperasiId) {
      throw new BadRequestException(
        'User Anda tidak terasosiasi dengan Koperasi mana pun di sistem.',
      );
    }

    const product = await this.findOrCreateProduct(jenisPupuk);

    const totalPrice = quantity * pricePerKg;
    const parsedDate = new Date(tanggal);
    const distributionDate = isNaN(parsedDate.getTime())
      ? new Date()
      : parsedDate;

    const distribution = await this.prisma.distribution.create({
      data: {
        koperasiId: user.koperasiId,
        productId: product.id,
        quantity,
        buyerName,
        tanggal: distributionDate,
        pricePerKg,
        totalPrice,
        notes,
      },
    });

    await this.writeAuditLog(
      'OUTGOING_DISTRIBUTION',
      JSON.stringify({
        distributionId: distribution.id,
        jenisPupuk,
        quantity,
        buyerName,
        totalPrice,
        pricePerKg,
        notes,
      }),
      userId,
    );

    return distribution;
  }

  // Audit Log writer helper
  async writeAuditLog(
    action: string,
    details: string,
    userId?: string,
  ): Promise<AuditLog> {
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

    let csv =
      'Order ID,Tanggal Transaksi,Nama Produk,Kuantitas (kg),Harga Satuan (Rp/kg),Total Harga (Rp),Status,Nama Pool Patungan\n';

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
