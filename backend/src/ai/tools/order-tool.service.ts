import { Injectable } from '@nestjs/common';

import { OrdersService } from '../../orders/orders.service.js';
import { OrderStatus } from '../../orders/entities/order.entity.js';

@Injectable()
export class OrderToolService {
    constructor(
        private readonly ordersService: OrdersService,
    ) { }

    async getOrderStatus(
        orderNumber: string,
    ) {
        const order =
            await this.ordersService.findByOrderNumber(
                orderNumber,
            );

        if (!order) {
            return {
                found: false,
                orderNumber,
                message: `Order ${orderNumber} was not found.`,
            };
        }

        return {
            found: true,
            orderNumber: order.orderNumber,
            status: order.status,
        };
    }

    async getOrder(
        orderNumber: string,
    ) {
        const order =
            await this.ordersService.findByOrderNumber(
                orderNumber,
            );

        if (!order) {
            return {
                found: false,
                orderNumber,
                message: `Order ${orderNumber} was not found.`,
            };
        }

        return {
            found: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                status: order.status,
                createdAt: order.createdAt,
            },
        };
    }

    async getOrderCountByStatus(
        status: string,
    ) {
        const count =
            await this.ordersService.countByStatus(
                status as OrderStatus,
            );

        return {
            status,
            count,
        };
    }

    async getOrderCountToday() {
        const count =
            await this.ordersService.countToday();

        return {
            date: new Date()
                .toISOString()
                .slice(0, 10),
            count,
        };
    }

    async getOrderCountByDateRange(
        from: string,
        to: string,
    ) {
        const count =
            await this.ordersService.countByDateRange(
                new Date(from),
                new Date(to),
            );

        return {
            from,
            to,
            count,
        };
    }

    async getOrderCountByPeriod(
        period: 'today' | 'yesterday',
    ) {
        return this.ordersService.countByPeriod(
            period,
        );
    }
}