import { PrismaService } from '../prisma/prisma.service';
import { Supplier, Product, PriceTier, Prisma } from '@prisma/client';
export declare class SupplierService {
    private prisma;
    constructor(prisma: PrismaService);
    createSupplier(data: Prisma.SupplierCreateInput): Promise<Supplier>;
    findAllSuppliers(): Promise<Supplier[]>;
    findSupplierById(id: string): Promise<Supplier | null>;
    createProduct(data: Prisma.ProductCreateInput): Promise<Product>;
    findProductById(id: string): Promise<Product | null>;
    createPriceTier(data: Prisma.PriceTierCreateInput): Promise<PriceTier>;
    findPriceTiersByProductId(productId: string): Promise<PriceTier[]>;
}
