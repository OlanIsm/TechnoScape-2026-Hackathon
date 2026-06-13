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
    async createManualTransaction(userId, jenisPupuk, quantity, supplierName, tanggal, totalPrice) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('Sesi Anda telah kedaluwarsa atau User tidak ditemukan. Silakan log out dan masuk kembali.');
        }
        if (!user.koperasiId) {
            throw new common_1.BadRequestException('User Anda tidak terasosiasi dengan Koperasi mana pun di sistem.');
        }
        let product = await this.prisma.product.findFirst({
            where: {
                name: { contains: jenisPupuk, mode: 'insensitive' },
            },
        });
        if (!product) {
            product = await this.prisma.product.findFirst();
        }
        if (!product) {
            throw new common_1.BadRequestException('Tidak ada produk pupuk terdaftar di sistem');
        }
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
        const priceAtPurchase = totalPrice / quantity;
        const parsedDate = new Date(tanggal);
        const orderDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
        const order = await this.prisma.order.create({
            data: {
                totalPrice,
                status: client_1.OrderStatus.DELIVERED,
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
        await this.writeAuditLog('MANUAL_TRANSACTION', JSON.stringify({
            orderId: order.id,
            jenisPupuk,
            quantity,
            supplierName,
            totalPrice,
        }), userId);
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
    async findAllProducts() {
        return this.prisma.product.findMany({
            include: { supplier: true, priceTiers: true },
        });
    }
    async createPool(data) {
        const product = await this.prisma.product.findUnique({ where: { id: data.productId } });
        if (!product) {
            throw new common_1.BadRequestException(`Produk dengan ID '${data.productId}' tidak ditemukan.`);
        }
        return this.prisma.collectivePool.create({
            data: {
                name: data.name,
                deadline: data.deadline,
                status: client_1.PoolStatus.ACTIVE,
                productId: data.productId,
            },
        });
    }
    async findAllActivePools() {
        return this.prisma.collectivePool.findMany({
            where: { status: client_1.PoolStatus.ACTIVE },
            include: {
                product: { include: { supplier: true, priceTiers: true } },
                orders: { include: { orderItems: true } },
            },
        });
    }
    async joinPool(poolId, orderId, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true },
        });
        if (!order) {
            throw new common_1.BadRequestException('Order tidak ditemukan');
        }
        if (order.status === client_1.OrderStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Tidak bisa bergabung ke pool karena order sudah dikonfirmasi (CONFIRMED)');
        }
        const pool = await this.prisma.collectivePool.findUnique({
            where: { id: poolId },
            include: {
                product: { include: { priceTiers: true } },
                orders: { include: { orderItems: true } },
            },
        });
        if (!pool || pool.status !== client_1.PoolStatus.ACTIVE) {
            throw new common_1.BadRequestException('Pool tidak aktif atau tidak ditemukan');
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: { collectivePoolId: poolId },
            include: { orderItems: true },
        });
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
        const sortedTiers = pool.product.priceTiers.sort((a, b) => b.minVolume - a.minVolume);
        let activePricePerKg = pool.product.priceTiers[0]?.pricePerKg || 9000;
        for (const tier of sortedTiers) {
            if (totalVolumeKg >= tier.minVolume) {
                activePricePerKg = tier.pricePerKg;
                break;
            }
        }
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
        await this.writeAuditLog('JOIN_POOL', JSON.stringify({
            orderId,
            poolId,
            totalVolumeKg,
            activePricePerKg,
        }), userId);
        return updatedOrder;
    }
    async finalizePool(poolId) {
        const pool = await this.prisma.collectivePool.findUnique({
            where: { id: poolId },
            include: {
                product: { include: { priceTiers: true } },
                orders: { include: { orderItems: true } },
            },
        });
        if (!pool) {
            throw new common_1.BadRequestException('Pool tidak ditemukan');
        }
        let totalVolumeKg = 0;
        for (const ord of pool.orders) {
            for (const item of ord.orderItems) {
                totalVolumeKg += item.quantity;
            }
        }
        const minTargetVolume = 10000;
        if (totalVolumeKg >= minTargetVolume) {
            const updatedPool = await this.prisma.collectivePool.update({
                where: { id: poolId },
                data: { status: client_1.PoolStatus.COMPLETED },
            });
            await this.writeAuditLog('FINALIZE_POOL_SUCCESS', JSON.stringify({ poolId, totalVolumeKg, status: 'COMPLETED' }));
            return {
                success: true,
                message: 'Pool berhasil mengumpulkan kuota target dan diselesaikan.',
                pool: updatedPool,
            };
        }
        else {
            const newDeadline = new Date();
            newDeadline.setDate(newDeadline.getDate() + 2);
            const updatedPool = await this.prisma.collectivePool.update({
                where: { id: poolId },
                data: {
                    deadline: newDeadline,
                },
            });
            await this.writeAuditLog('FINALIZE_POOL_FALLBACK_GRACE', JSON.stringify({ poolId, totalVolumeKg, extendedDeadline: newDeadline }));
            return {
                success: false,
                message: 'Volume target tidak tercapai. Grace period aktif: pool diperpanjang 2 hari.',
                pool: updatedPool,
            };
        }
    }
    async createDistribution(userId, jenisPupuk, quantity, buyerName, tanggal, pricePerKg, notes) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('Sesi Anda telah kedaluwarsa atau User tidak ditemukan. Silakan log out dan masuk kembali.');
        }
        if (!user.koperasiId) {
            throw new common_1.BadRequestException('User Anda tidak terasosiasi dengan Koperasi mana pun di sistem.');
        }
        let product = await this.prisma.product.findFirst({
            where: {
                name: { contains: jenisPupuk, mode: 'insensitive' },
            },
        });
        if (!product) {
            product = await this.prisma.product.findFirst();
        }
        if (!product) {
            throw new common_1.BadRequestException('Tidak ada produk pupuk terdaftar di sistem');
        }
        const totalPrice = quantity * pricePerKg;
        const parsedDate = new Date(tanggal);
        const distributionDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
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
        await this.writeAuditLog('OUTGOING_DISTRIBUTION', JSON.stringify({
            distributionId: distribution.id,
            jenisPupuk,
            quantity,
            buyerName,
            totalPrice,
            pricePerKg,
            notes,
        }), userId);
        return distribution;
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