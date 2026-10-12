import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPING = 'SHIPPING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'order_number',
        unique: true,
    })
    orderNumber: string;

    @Column({
        name: 'customer_name',
    })
    customerName: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @CreateDateColumn({
        name: 'created_at',
    })
    createdAt: Date;
}