import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Between,
    Repository,
} from 'typeorm';

import {
    Order,
    OrderStatus,
} from './entities/order.entity.js';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) { }

    async findByOrderNumber(
        orderNumber: string,
    ): Promise<Order | null> {
        return this.orderRepository.findOne({
            where: {
                orderNumber,
            },
        });
    }

    async countByStatus(
        status: OrderStatus,
    ): Promise<number> {
        return this.orderRepository.count({
            where: {
                status,
            },
        });
    }

    async countToday(): Promise<number> {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        return this.orderRepository.count({
            where: {
                createdAt: Between(
                    startOfToday,
                    endOfToday,
                ),
            },
        });
    }

    async countByDateRange(
        from: Date,
        to: Date,
    ): Promise<number> {
        return this.orderRepository.count({
            where: {
                createdAt: Between(from, to),
            },
        });
    }

    async countByPeriod(
        period: 'today' | 'yesterday',
    ): Promise<{
        period: string;
        from: Date;
        to: Date;
        count: number;
    }> {
        const now = new Date();

        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        if (period === 'yesterday') {
            start.setDate(start.getDate() - 1);
            end.setDate(end.getDate() - 1);
        }

        const count =
            await this.countByDateRange(start, end);

        return {
            period,
            from: start,
            to: end,
            count,
        };
    }
}