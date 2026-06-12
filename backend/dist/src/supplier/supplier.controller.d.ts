import { SupplierService } from './supplier.service';
import { Prisma } from '@prisma/client';
export declare class SupplierController {
    private readonly supplierService;
    constructor(supplierService: SupplierService);
    createSupplier(data: Prisma.SupplierCreateInput): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        phone: string;
    }>;
    findAllSuppliers(): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        phone: string;
    }[]>;
    findSupplierById(id: string): Promise<{
        name: string;
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        phone: string;
    }>;
    createProduct(data: Prisma.ProductUncheckedCreateInput): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        supplierId: string;
    }>;
    createPriceTier(data: Prisma.PriceTierUncheckedCreateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        minVolume: number;
        maxVolume: number | null;
        pricePerKg: number;
        productId: string;
    }>;
}
