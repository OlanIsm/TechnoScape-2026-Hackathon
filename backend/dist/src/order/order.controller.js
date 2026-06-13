"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const client_1 = require("@prisma/client");
const auth_guard_1 = require("../auth/auth.guard");
let OrderController = class OrderController {
    orderService;
    constructor(orderService) {
        this.orderService = orderService;
    }
    async createOrder(data) {
        return this.orderService.createOrder(data);
    }
    async createManual(req, jenisPupuk, quantity, supplierName, tanggal, totalPrice) {
        const userId = req.user.sub;
        return this.orderService.createManualTransaction(userId, jenisPupuk, Number(quantity), supplierName, tanggal, Number(totalPrice));
    }
    async confirmOrder(id, userId) {
        return this.orderService.confirmOrder(id, userId);
    }
    async createPool(data) {
        return this.orderService.createPool(data);
    }
    async findAllActivePools() {
        return this.orderService.findAllActivePools();
    }
    async findAllProducts() {
        return this.orderService.findAllProducts();
    }
    async joinPool(poolId, orderId, userId) {
        return this.orderService.joinPool(poolId, orderId, userId);
    }
    async finalizePool(poolId) {
        return this.orderService.finalizePool(poolId);
    }
    async getAuditLogs() {
        return this.orderService.getAuditLogs();
    }
    async exportCsv(req, res) {
        const userId = req.user.sub;
        const csvData = await this.orderService.exportOrdersToCsv(userId);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=laporan_transaksi.csv');
        return res.status(200).send(csvData);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('manual'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('jenisPupuk')),
    __param(2, (0, common_1.Body)('quantity')),
    __param(3, (0, common_1.Body)('supplierName')),
    __param(4, (0, common_1.Body)('tanggal')),
    __param(5, (0, common_1.Body)('totalPrice')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, String, String, Number]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createManual", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "confirmOrder", null);
__decorate([
    (0, common_1.Post)('pools'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createPool", null);
__decorate([
    (0, common_1.Get)('pools/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findAllActivePools", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "findAllProducts", null);
__decorate([
    (0, common_1.Post)('pools/:poolId/join'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Body)('orderId')),
    __param(2, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "joinPool", null);
__decorate([
    (0, common_1.Post)('pools/:poolId/finalize'),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "finalizePool", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('export-csv'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "exportCsv", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map