import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { EmbeddingService } from '../embedding/embedding.service.js';
import { ChunkingService } from './services/chunking.service.js';
import { DocumentSearchResult } from './types/document-search-result.type.js';

@Injectable()
export class DocumentService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly embeddingService: EmbeddingService,
        private readonly chunkingService: ChunkingService,
    ) { }

    async create(content: string) {
        const chunks = this.chunkingService.split(content);

        const results = [];

        for (const chunk of chunks) {
            const embedding = await this.embeddingService.embed(
                chunk.content,
            );

            const result = await this.dataSource.query(
                `
                INSERT INTO documents (
                    content,
                    metadata,
                    embedding
                )
                VALUES (
                    $1,
                    $2::jsonb,
                    $3::vector
                )
                RETURNING id, content, metadata, created_at
                `,
                [
                    chunk.content,
                    JSON.stringify({
                        chunkIndex: chunk.index,
                    }),
                    `[${embedding.join(',')}]`,
                ],
            );

            results.push(result[0]);
        }

        return results;
    }

    async search(
        query: string,
        limit = 5,
    ): Promise<DocumentSearchResult[]> {
        const embedding =
            await this.embeddingService.embed(query);

        const MAX_DISTANCE = 0.25;

        const result: DocumentSearchResult[] =
            await this.dataSource.query(
                `
            SELECT
                id,
                content,
                metadata,
                embedding <=> $1::vector AS distance
            FROM documents
            WHERE embedding <=> $1::vector <= $3
            ORDER BY embedding <=> $1::vector
            LIMIT $2
            `,
                [
                    `[${embedding.join(',')}]`,
                    limit,
                    MAX_DISTANCE,
                ],
            );

        console.log(
            '[RAG RESULT]',
            JSON.stringify(
                result,
                null,
                2,
            ),
        );

        return result;
    }
}