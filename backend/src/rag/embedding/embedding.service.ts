import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
    private readonly ollamaUrl = 'http://localhost:11434';

    async embed(text: string): Promise<number[]> {
        const response = await axios.post(
            `${this.ollamaUrl}/api/embeddings`,
            {
                model: 'nomic-embed-text',
                prompt: text,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data.embedding;
    }
}