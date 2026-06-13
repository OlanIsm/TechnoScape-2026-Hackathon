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
    joinPool(poolId: string, orderId: string, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        koperasiId: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        totalPrice: number;
        collectivePoolId: string | null;
    }>;
    getAuditLogs(): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        details: string;
        userId: string | null;
    }[]>;
    exportCsv(req: any, res: ExpressResponse): Promise<ExpressResponse<any, Record<string, any>>>;
}
