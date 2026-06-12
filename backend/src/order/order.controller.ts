import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { Prisma } from '@prisma/client';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() data: Prisma.OrderUncheckedCreateInput) {
    return this.orderService.createOrder(data);
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

  @Post('pools/:poolId/join')
  async joinPool(
    @Param('poolId') poolId: string,
    @Body('orderId') orderId: string,
    @Body('userId') userId?: string,
  ) {
    return this.orderService.joinPool(poolId, orderId, userId);
  }

  @Get('audit-logs')
  async getAuditLogs() {
    return this.orderService.getAuditLogs();
  }
}
