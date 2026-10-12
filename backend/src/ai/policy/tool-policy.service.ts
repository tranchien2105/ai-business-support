import { Injectable } from '@nestjs/common';

@Injectable()
export class ToolPolicyService {
    detectRequiredTools(
        message: string,
    ): string[] {
        const normalized =
            message.toLowerCase();

        const requiredTools =
            new Set<string>();

        // ============================================
        // ORDER NUMBER
        // ============================================

        const orderNumberRegex =
            /ord-\d+/i;

        if (
            orderNumberRegex.test(message)
        ) {
            requiredTools.add(
                'getOrderStatus',
            );
        }

        // ============================================
        // ORDER COUNT
        // ============================================

        const asksOrderCount =
            normalized.includes(
                'bao nhiêu đơn',
            ) ||
            normalized.includes(
                'số lượng đơn',
            ) ||
            normalized.includes(
                'tổng số đơn',
            );

        // ============================================
        // TODAY
        // ============================================

        const asksToday =
            normalized.includes(
                'hôm nay',
            );

        if (
            asksOrderCount &&
            asksToday
        ) {
            requiredTools.add(
                'getOrderCountToday',
            );
        }

        // ============================================
        // YESTERDAY
        // ============================================

        const asksYesterday =
            normalized.includes(
                'hôm qua',
            );

        if (
            asksOrderCount &&
            asksYesterday
        ) {
            requiredTools.add(
                'getOrderCountByPeriod',
            );
        }

        // ============================================
        // ORDER COUNT BY STATUS
        // ============================================

        const statuses = [
            'pending',
            'confirmed',
            'processing',
            'shipping',
            'completed',
            'cancelled',
        ];

        const hasOrderStatus =
            statuses.some(
                (status) =>
                    normalized.includes(
                        status,
                    ),
            );

        if (
            asksOrderCount &&
            hasOrderStatus
        ) {
            requiredTools.add(
                'getOrderCountByStatus',
            );
        }

        // ============================================
        // KNOWLEDGE BASE / RAG
        // ============================================

        const knowledgeKeywords = [
            // General knowledge
            'chính sách',
            'quy định',
            'hướng dẫn',
            'tài liệu',
            'điều kiện',
            'quy trình',

            // Return / exchange
            'đổi sản phẩm',
            'đổi hàng',
            'đổi trả',
            'trả hàng',

            // Warranty
            'bảo hành',

            // Refund
            'hoàn tiền',
            'refund',

            // Product issues
            'sản phẩm lỗi',
            'hàng lỗi',
            'lỗi sản phẩm',
            'sản phẩm bị lỗi',
            'lỗi do nhà sản xuất',
            'nhà sản xuất',
        ];

        const needsKnowledgeBase =
            knowledgeKeywords.some(
                (keyword) =>
                    normalized.includes(
                        keyword,
                    ),
            );

        if (needsKnowledgeBase) {
            requiredTools.add(
                'searchKnowledgeBase',
            );
        }

        return [
            ...requiredTools,
        ];
    }
}