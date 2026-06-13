"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrderService = class OrderService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(data) {
        const order = await this.prisma.order.create({
            data: {
                totalPrice: data.totalPrice,
                status: client_1.OrderStatus.PENDING,
                koperasi: { connect: { id: data.koperasiId } },
                collectivePool: data.collectivePoolId ? { connect: { id: data.collectivePoolId } } : undefined,
                orderItems: {
                    create: data.orderItems,
                },
            },
            include: { orderItems: true },
        });
        await this.writeAuditLog('CREATE_ORDER', JSON.stringify({ orderId: order.id, totalPrice: order.totalPrice }), undefined);
        return order;
    }
    async confirmOrder(orderId, userId) {
        const existingOrder = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!existingOrder) {
            throw new common_1.BadRequestException('Order tidak ditemukan');
        }
        if (existingOrder.status === client_1.OrderStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Order sudah berstatus CONFIRMED dan tidak dapat diubah (Immutable Ledger)');
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: client_1.OrderStatus.CONFIRMED },
        });
        await this.writeAuditLog('CONFIRM_ORDER', JSON.stringify({ orderId, statusBefore: existingOrder.status, statusAfter: client_1.OrderStatus.CONFIRMED }), userId);
        return updatedOrder;
    }
    async createPool(data) {
        return this.prisma.collectivePool.create({
            data: {
                name: data.name,
                deadline: data.deadline,
                status: client_1.PoolStatus.ACTIVE,
                product: { connect: { id: data.productId } },
            },
        });
    }
    async findAllActivePools() {
        return this.prisma.collectivePool.findMany({
            where: { status: client_1.PoolStatus.ACTIVE },
            include: {
                product: { include: { supplier: true } },
                orders: { include: { orderItems: true } },
            },
        });
    }
    async joinPool(poolId, orderId, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.BadRequestException('Order tidak ditemukan');
        }
        if (order.status === client_1.OrderStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Tidak bisa bergabung ke pool karena order sudah dikonfirmasi (CONFIRMED)');
        }
        const pool = await this.prisma.collectivePool.findUnique({
            where: { id: poolId },
        });
        if (!pool || pool.status !== client_1.PoolStatus.ACTIVE) {
            throw new common_1.BadRequestException('Pool tidak aktif atau tidak ditemukan');
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: { collectivePoolId: poolId },
        });
        await this.writeAuditLog('JOIN_POOL', JSON.stringify({ orderId, poolId }), userId);
        return updatedOrder;
    }
    async writeAuditLog(action, details, userId) {
        return this.prisma.auditLog.create({
            data: {
                action,
                details,
                userId: userId || undefined,
            },
        });
    }
    async getAuditLogs() {
        return this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });
    }
    async exportOrdersToCsv(userId) {
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
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map