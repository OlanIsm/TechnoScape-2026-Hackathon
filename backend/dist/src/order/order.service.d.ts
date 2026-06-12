import { PrismaService } from '../prisma/prisma.service';
import { Order, CollectivePool, AuditLog, Prisma } from '@prisma/client';
export declare class OrderService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrder(data: Prisma.OrderUncheckedCreateInput): Promise<Order>;
    confirmOrder(orderId: string, userId?: string): Promise<Order>;
    createPool(data: Prisma.CollectivePoolUncheckedCreateInput): Promise<CollectivePool>;
    findAllActivePools(): Promise<any[]>;
    joinPool(poolId: string, orderId: string, userId?: string): Promise<Order>;
    writeAuditLog(action: string, details: string, userId?: string): Promise<AuditLog>;
    getAuditLogs(): Promise<AuditLog[]>;
}
