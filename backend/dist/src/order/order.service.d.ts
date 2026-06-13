import { PrismaService } from '../prisma/prisma.service';
import { Order, CollectivePool, AuditLog, Prisma } from '@prisma/client';
export declare class OrderService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrder(data: Prisma.OrderUncheckedCreateInput): Promise<Order>;
    createManualTransaction(userId: string, jenisPupuk: string, quantity: number, supplierName: string, tanggal: string, totalPrice: number): Promise<{
        orderItems: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            quantity: number;
            priceAtPurchase: number;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        koperasiId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        totalPrice: number;
        collectivePoolId: string | null;
    }>;
    confirmOrder(orderId: string, userId?: string): Promise<Order>;
    findAllProducts(): Promise<({
        supplier: {
            id: string;
            name: string;
            address: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string;
        };
        priceTiers: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            minVolume: number;
            maxVolume: number | null;
            pricePerKg: number;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        supplierId: string;
    })[]>;
    createPool(data: Prisma.CollectivePoolUncheckedCreateInput): Promise<CollectivePool>;
    findAllActivePools(): Promise<any[]>;
    joinPool(poolId: string, orderId: string, userId?: string): Promise<Order>;
    finalizePool(poolId: string): Promise<any>;
    writeAuditLog(action: string, details: string, userId?: string): Promise<AuditLog>;
    getAuditLogs(): Promise<AuditLog[]>;
    exportOrdersToCsv(userId: string): Promise<string>;
}
