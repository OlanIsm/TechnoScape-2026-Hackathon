import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { Prisma } from '@prisma/client';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async createSupplier(@Body() data: Prisma.SupplierCreateInput) {
    return this.supplierService.createSupplier(data);
  }

  @Get()
  async findAllSuppliers() {
    return this.supplierService.findAllSuppliers();
  }

  @Get(':id')
  async findSupplierById(@Param('id') id: string) {
    const supplier = await this.supplierService.findSupplierById(id);
    if (!supplier) {
      throw new NotFoundException('Supplier tidak ditemukan');
    }
    return supplier;
  }

  @Post('products')
  async createProduct(@Body() data: Prisma.ProductUncheckedCreateInput) {
    return this.supplierService.createProduct({
      name: data.name,
      description: data.description,
      supplier: { connect: { id: data.supplierId } },
    });
  }

  @Post('price-tiers')
  async createPriceTier(@Body() data: Prisma.PriceTierUncheckedCreateInput) {
    return this.supplierService.createPriceTier({
      minVolume: data.minVolume,
      maxVolume: data.maxVolume,
      pricePerKg: data.pricePerKg,
      product: { connect: { id: data.productId } },
    });
  }
}
