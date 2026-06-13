import { Controller, Post, Get, Body, Param, Query, UseGuards, Request, Response } from '@nestjs/common';
import { OrderService } from './order.service';
import { Prisma } from '@prisma/client';
import type { Response as ExpressResponse } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() data: Prisma.OrderUncheckedCreateInput) {
    return this.orderService.createOrder(data);
  }

  @UseGuards(AuthGuard)
  @Post('manual')
  async createManual(
    @Request() req,
    @Body('jenisPupuk') jenisPupuk: string,
    @Body('quantity') quantity: number,
    @Body('supplierName') supplierName: string,
    @Body('tanggal') tanggal: string,
    @Body('totalPrice') totalPrice: number,
  ) {
    const userId = req.user.sub;
    return this.orderService.createManualTransaction(
      userId,
      jenisPupuk,
      Number(quantity),
      supplierName,
      tanggal,
      Number(totalPrice),
    );
  }

  @UseGuards(AuthGuard)
  @Post('distribution')
  async createDistribution(
    @Request() req,
    @Body('jenisPupuk') jenisPupuk: string,
    @Body('quantity') quantity: number,
    @Body('buyerName') buyerName: string,
    @Body('tanggal') tanggal: string,
    @Body('pricePerKg') pricePerKg: number,
    @Body('notes') notes?: string,
  ) {
    const userId = req.user.sub;
    return this.orderService.createDistribution(
      userId,
      jenisPupuk,
      Number(quantity),
      buyerName,
      tanggal,
      Number(pricePerKg),
      notes,
    );
  }

  @Post(':id/confirm')
  async confirmOrder(
    @Param('id') id: string,
    @Body('userId') userId?: string,
  ) {
    return this.orderService.confirmOrder(id, userId);
  }

  @Post('pools')
  async createPool(@Body() data: Prisma.CollectivePoolUncheckedCreateInput) {
    return this.orderService.createPool(data);
  }

  @Get('pools/active')
  async findAllActivePools() {
    return this.orderService.findAllActivePools();
  }

  @Get('products')
  async findAllProducts() {
    return this.orderService.findAllProducts();
  }

  @Post('pools/:poolId/join')
  async joinPool(
    @Param('poolId') poolId: string,
    @Body('orderId') orderId: string,
    @Body('userId') userId?: string,
  ) {
    return this.orderService.joinPool(poolId, orderId, userId);
  }

  @Post('pools/:poolId/finalize')
  async finalizePool(@Param('poolId') poolId: string) {
    return this.orderService.finalizePool(poolId);
  }

  @Get('audit-logs')
  async getAuditLogs() {
    return this.orderService.getAuditLogs();
  }

  @UseGuards(AuthGuard)
  @Get('export-csv')
  async exportCsv(@Request() req, @Response() res: ExpressResponse) {
    const userId = req.user.sub;
    const csvData = await this.orderService.exportOrdersToCsv(userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan_transaksi.csv');
    return res.status(200).send(csvData);
  }
}
