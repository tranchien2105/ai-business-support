import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { Order } from './entities/order.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
  ],

  controllers: [OrdersController],

  providers: [OrdersService],

  exports: [OrdersService],
})
export class OrdersModule { }