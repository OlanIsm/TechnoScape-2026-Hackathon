import { OrderService } from './order.service';
import { Prisma } from '@prisma/client';
import type { Response as ExpressResponse } from 'express';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    createOrder(data: Prisma.OrderUncheckedCreateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        koperasiId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        totalPrice: number;
        collectivePoolId: string | null;
    }>;
    createManual(req: any, jenisPupuk: string, quantity: number, supplierName: string, tanggal: string, totalPrice: number): Promise<{
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
    confirmOrder(id: string, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        koperasiId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        totalPrice: number;
        collectivePoolId: string | null;
    }>;
    createPool(data: Prisma.CollectivePoolUncheckedCreateInput): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PoolStatus;
        deadline: Date;
        productId: string;
    }>;
    findAllActivePools(): Promise<any[]>;
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
    joinPool(poolId: string, orderId: string, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        koperasiId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        totalPrice: number;
        collectivePoolId: string | null;
    }>;
    finalizePool(poolId: string): Promise<any>;
    getAuditLogs(): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        details: string;
        userId: string | null;
    }[]>;
    exportCsv(req: any, res: ExpressResponse): Promise<ExpressResponse<any, Record<string, any>>>;
}
