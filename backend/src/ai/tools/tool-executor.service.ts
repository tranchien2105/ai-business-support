import { Injectable } from '@nestjs/common';

import { DocumentService } from '../../rag/document/document.service.js';

import { OrderToolService } from './order-tool.service.js';

@Injectable()
export class ToolExecutorService {
    constructor(
        private readonly orderToolService: OrderToolService,
        private readonly documentService: DocumentService,
    ) { }

    async execute(
        toolName: string,
        toolArguments: Record<
            string,
            any
        >,
    ): Promise<unknown> {
        // ============================================
        // getOrderStatus
        // ============================================

        if (
            toolName ===
            'getOrderStatus'
        ) {
            return this.orderToolService
                .getOrderStatus(
                    String(
                        toolArguments.orderNumber,
                    ),
                );
        }

        // ============================================
        // getOrder
        // ============================================

        if (
            toolName === 'getOrder'
        ) {
            return this.orderToolService
                .getOrder(
                    String(
                        toolArguments.orderNumber,
                    ),
                );
        }

        // ============================================
        // getOrderCountByStatus
        // ============================================

        if (
            toolName ===
            'getOrderCountByStatus'
        ) {
            return this.orderToolService
                .getOrderCountByStatus(
                    String(
                        toolArguments.status,
                    ),
                );
        }

        // ============================================
        // getOrderCountToday
        // ============================================

        if (
            toolName ===
            'getOrderCountToday'
        ) {
            return this.orderToolService
                .getOrderCountToday();
        }

        // ============================================
        // getOrderCountByDateRange
        // ============================================

        if (
            toolName ===
            'getOrderCountByDateRange'
        ) {
            return this.orderToolService
                .getOrderCountByDateRange(
                    String(
                        toolArguments.from,
                    ),
                    String(
                        toolArguments.to,
                    ),
                );
        }

        // ============================================
        // getOrderCountByPeriod
        // ============================================

        if (
            toolName ===
            'getOrderCountByPeriod'
        ) {
            return this.orderToolService
                .getOrderCountByPeriod(
                    String(
                        toolArguments.period,
                    ) as
                    | 'today'
                    | 'yesterday',
                );
        }

        // ============================================
        // searchKnowledgeBase
        // ============================================

        if (
            toolName ===
            'searchKnowledgeBase'
        ) {
            const query =
                String(
                    toolArguments.query ?? '',
                );

            console.log(
                '[RAG SEARCH]',
                {
                    query,
                },
            );

            const results =
                await this.documentService
                    .search(
                        query,
                        3,
                    );

            console.log(
                '[RAG RESULT]',
                results,
            );

            // Không tìm thấy document
            if (
                results.length === 0
            ) {
                return {
                    found: false,
                    query,
                    sources: [],
                };
            }

            // Tìm thấy document
            return {
                found: true,
                query,
                sources: results.map(
                    (result) => ({
                        id: result.id,
                        content:
                            result.content,
                        distance:
                            result.distance,
                        metadata:
                            result.metadata,
                    }),
                ),
            };
        }

        // ============================================
        // UNKNOWN TOOL
        // ============================================

        console.log(
            '[AI UNKNOWN TOOL]',
            toolName,
        );

        return undefined;
    }
}