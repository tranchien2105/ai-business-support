import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { DocumentService } from './document/document.service.js';

@Injectable()
export class RagService {
    private readonly ollamaUrl = 'http://localhost:11434';

    constructor(
        private readonly documentService: DocumentService,
    ) { }

    async ask(question: string) {
        const documents = await this.documentService.search(
            question,
            3,
        );

        const context = documents
            .map(
                (document, index) =>
                    `[Document ${index + 1}]
                ${document.content}`,
            )
            .join('\n\n');

        const prompt = `
            Bạn là AI Customer Support.

            Hãy trả lời câu hỏi dựa trên CONTEXT được cung cấp.

            QUY TẮC:
            - Chỉ sử dụng thông tin trong CONTEXT.
            - Không được tự bịa thông tin.
            - Nếu CONTEXT không có câu trả lời, hãy nói rằng bạn không tìm thấy thông tin phù hợp.

            CONTEXT:
            ${context}

            QUESTION:
            ${question}
            `;

        const response = await axios.post(
            `${this.ollamaUrl}/api/chat`,
            {
                model: 'qwen3:1.7b',
                stream: false,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        return {
            answer: response.data.message.content,
            sources: documents.map((document) => ({
                id: document.id,
                content: document.content,
                distance: document.distance,
            })),
        };
    }
}