import { Injectable } from '@nestjs/common';

import { OllamaService } from './llm/ollama.service.js';
import { ToolPolicyService } from './policy/tool-policy.service.js';
import { AI_SYSTEM_PROMPT } from './prompts/ai-system.prompt.js';
import { ToolExecutorService } from './tools/tool-executor.service.js';

import {
    getOrderStatusTool,
    getOrderTool,
    getOrderCountByStatusTool,
    getOrderCountTodayTool,
    getOrderCountByDateRangeTool,
    getOrderCountByPeriodTool,
} from './tools/order.tools.js';

import { searchKnowledgeBaseTool } from './tools/rag.tools.js';

@Injectable()
export class AiService {
    constructor(
        private readonly ollamaService: OllamaService,
        private readonly toolPolicyService: ToolPolicyService,
        private readonly toolExecutorService: ToolExecutorService,
    ) { }

    async chat(
        message: string,
        history: {
            role: 'user' | 'assistant';
            content: string;
        }[],
        onChunk: (
            content: string,
        ) => void,
    ) {
        const messages: any[] = [
            {
                role: 'system',
                content: AI_SYSTEM_PROMPT,
            },

            ...history,

            {
                role: 'user',
                content: message,
            },
        ];

        const tools = [
            getOrderStatusTool,
            getOrderTool,
            getOrderCountByStatusTool,
            getOrderCountTodayTool,
            getOrderCountByDateRangeTool,
            getOrderCountByPeriodTool,
            searchKnowledgeBaseTool,
        ];

        // ============================================
        // Application xác định tool bắt buộc
        // ============================================

        const requiredTools =
            this.toolPolicyService
                .detectRequiredTools(
                    message,
                );

        console.log(
            '[AI REQUIRED TOOLS]',
            requiredTools,
        );

        const MAX_TOOL_ROUNDS = 3;

        // ============================================
        // TOOL CALLING LOOP
        // ============================================

        for (
            let round = 0;
            round < MAX_TOOL_ROUNDS;
            round++
        ) {
            console.log(
                `[AI TOOL ROUND ${round + 1}]`,
            );

            const response =
                await this.ollamaService.chat(
                    messages,
                    tools,
                );

            const assistantMessage =
                response.data.message;

            console.log(
                '[OLLAMA RESPONSE]',
                JSON.stringify(
                    response.data,
                    null,
                    2,
                ),
            );

            const toolCalls =
                assistantMessage?.tool_calls ??
                [];

            // ========================================
            // MODEL KHÔNG GỌI TOOL
            // ========================================

            if (
                toolCalls.length === 0
            ) {
                const missingTools =
                    this.findMissingTools(
                        requiredTools,
                        messages,
                    );

                // ====================================
                // Model không gọi nhưng application
                // biết câu hỏi bắt buộc cần tool
                // ====================================

                if (
                    missingTools.length > 0
                ) {
                    console.log(
                        '[AI MISSING REQUIRED TOOLS]',
                        missingTools,
                    );

                    for (
                        const toolName of
                        missingTools
                    ) {
                        const toolCall =
                            this.createFallbackToolCall(
                                toolName,
                                message,
                            );

                        const toolResult =
                            await this.toolExecutorService
                                .execute(
                                    toolName,
                                    toolCall
                                        .function
                                        .arguments,
                                );

                        this.appendToolResult(
                            messages,
                            toolCall,
                            toolResult,
                        );
                    }

                    // Quay lại loop.
                    // Qwen sẽ nhận tool result
                    // và tạo final answer.
                    continue;
                }

                // ====================================
                // Không cần tool
                // ====================================

                onChunk(
                    assistantMessage?.content ??
                    '',
                );

                return;
            }

            // ========================================
            // MODEL ĐÃ GỌI TOOL
            // ========================================

            for (
                const toolCall of toolCalls
            ) {
                const toolName =
                    toolCall.function?.name;

                const toolArguments =
                    toolCall.function
                        ?.arguments ?? {};

                if (!toolName) {
                    continue;
                }

                console.log(
                    '[AI TOOL CALL]',
                    {
                        toolName,
                        toolArguments,
                    },
                );

                const toolResult =
                    await this.toolExecutorService
                        .execute(
                            toolName,
                            toolArguments,
                        );

                if (
                    toolResult ===
                    undefined
                ) {
                    continue;
                }

                console.log(
                    '[AI TOOL RESULT]',
                    {
                        toolName,
                        toolResult,
                    },
                );

                this.appendToolResult(
                    messages,
                    toolCall,
                    toolResult,
                );
            }

            // Sau khi execute tool,
            // loop tiếp để Qwen quyết định:
            //
            // - gọi thêm tool
            // - hoặc trả final answer
        }

        // ============================================
        // SAFETY FALLBACK
        // ============================================

        onChunk(
            'Xin lỗi, hệ thống không thể hoàn tất yêu cầu này.',
        );
    }

    // ============================================================
    // CHECK MISSING REQUIRED TOOLS
    // ============================================================

    private findMissingTools(
        requiredTools: string[],
        messages: any[],
    ): string[] {
        return requiredTools.filter(
            (requiredTool) =>
                !messages.some(
                    (message) =>
                        message.role ===
                        'assistant' &&
                        message.tool_calls?.some(
                            (toolCall: any) =>
                                toolCall
                                    .function
                                    ?.name ===
                                requiredTool,
                        ),
                ),
        );
    }

    // ============================================================
    // APPEND TOOL RESULT
    // ============================================================

    private appendToolResult(
        messages: any[],
        toolCall: any,
        toolResult: unknown,
    ) {
        messages.push({
            role: 'assistant',
            content: '',
            tool_calls: [
                toolCall,
            ],
        });

        messages.push({
            role: 'tool',
            content:
                JSON.stringify(
                    toolResult,
                ),
        });
    }

    // ============================================================
    // FALLBACK TOOL CALL
    // ============================================================

    private createFallbackToolCall(
        toolName: string,
        message: string,
    ) {
        let arguments_: Record<
            string,
            unknown
        > = {};

        const normalized =
            message.toLowerCase();

        // ============================================
        // RAG
        // ============================================

        if (
            toolName ===
            'searchKnowledgeBase'
        ) {
            arguments_ = {
                query: message,
            };
        }

        // ============================================
        // TODAY
        // ============================================

        if (
            toolName ===
            'getOrderCountToday'
        ) {
            arguments_ = {};
        }

        // ============================================
        // YESTERDAY
        // ============================================

        if (
            toolName ===
            'getOrderCountByPeriod'
        ) {
            arguments_ = {
                period: 'yesterday',
            };
        }

        // ============================================
        // ORDER STATUS
        // ============================================

        if (
            toolName ===
            'getOrderStatus'
        ) {
            const match =
                message.match(
                    /ord-\d+/i,
                );

            arguments_ = {
                orderNumber:
                    match?.[0] ?? '',
            };
        }

        // ============================================
        // COUNT BY STATUS
        // ============================================

        if (
            toolName ===
            'getOrderCountByStatus'
        ) {
            const statuses = [
                'pending',
                'confirmed',
                'processing',
                'shipping',
                'completed',
                'cancelled',
            ];

            const status =
                statuses.find(
                    (value) =>
                        normalized.includes(
                            value,
                        ),
                );

            arguments_ = {
                status:
                    status?.toUpperCase() ??
                    '',
            };
        }

        return {
            id: `fallback-${Date.now()}`,

            type: 'function',

            function: {
                name: toolName,
                arguments: arguments_,
            },
        };
    }
}