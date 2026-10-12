import {
    Controller,
    Get,
    NotFoundException,
    Param,
} from '@nestjs/common';

import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
    ) { }

    @Get(':orderNumber')
    async getOrder(
        @Param('orderNumber') orderNumber: string,
    ) {
        const order =
            await this.ordersService.findByOrderNumber(orderNumber);

        if (!order) {
            throw new NotFoundException(
                `Order ${orderNumber} not found`,
            );
        }

        return order;
    }
}