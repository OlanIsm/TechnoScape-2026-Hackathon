import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Supplier, Product, PriceTier, Prisma } from '@prisma/client';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  // Supplier CRUD
  async createSupplier(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return this.prisma.supplier.create({ data });
  }

  async findAllSuppliers(): Promise<Supplier[]> {
    return this.prisma.supplier.findMany({
      include: { products: true },
    });
  }

  async findSupplierById(id: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: { products: { include: { priceTiers: true } } },
    });
  }

  // Product CRUD
  async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async findProductById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: { priceTiers: true, supplier: true },
    });
  }

  // PriceTier CRUD
  async createPriceTier(data: Prisma.PriceTierCreateInput): Promise<PriceTier> {
    return this.prisma.priceTier.create({ data });
  }

  async findPriceTiersByProductId(productId: string): Promise<PriceTier[]> {
    return this.prisma.priceTier.findMany({
      where: { productId },
      orderBy: { minVolume: 'asc' },
    });
  }
}
