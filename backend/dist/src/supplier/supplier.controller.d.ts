import { SupplierService } from './supplier.service';
import { Prisma } from '@prisma/client';
export declare class SupplierController {
    private readonly supplierService;
    constructor(supplierService: SupplierService);
    createSupplier(data: Prisma.SupplierCreateInput): Promise<{
        id: string;
        name: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string;
    }>;
    findAllSuppliers(): Promise<{
        id: string;
        name: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string;
    }[]>;
    findSupplierById(id: string): Promise<{
        id: string;
        name: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string;
    }>;
    createProduct(data: Prisma.ProductUncheckedCreateInput): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        supplierId: string;
    }>;
    createPriceTier(data: Prisma.PriceTierUncheckedCreateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        minVolume: number;
        maxVolume: number | null;
        pricePerKg: number;
    }>;
}
