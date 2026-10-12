import { Body, Controller, Get, Post } from '@nestjs/common';

import { EmbeddingService } from './embedding/embedding.service.js';
import { DocumentService } from './document/document.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { SearchDocumentDto } from './dto/search-document.dto.js';
import { RagService } from './rag.service.js';

import { ChunkingService } from './document/services/chunking.service.js';

@Controller('rag')
export class RagController {
    constructor(
        private readonly embeddingService: EmbeddingService,
        private readonly documentService: DocumentService,
        private readonly ragService: RagService,
        private readonly chunkingService: ChunkingService
    ) { }

    @Get('embedding-test')
    async embeddingTest() {
        const embedding = await this.embeddingService.embed(
            'Khách hàng có thể đổi sản phẩm trong vòng 7 ngày',
        );

        return {
            dimension: embedding.length,
            first10: embedding.slice(0, 10),
        };
    }

    @Post('documents')
    async createDocument(
        @Body() dto: CreateDocumentDto,
    ) {
        return this.documentService.create(dto.content);
    }

    @Post('search')
    async search(
        @Body() dto: SearchDocumentDto,
    ) {
        return this.documentService.search(dto.query);
    }

    @Post('ask')
    async ask(
        @Body() body: { question: string },
    ) {
        return this.ragService.ask(body.question);
    }

    @Post('chunk')
    chunk(@Body('content') content: string) {
        return this.chunkingService.split(content);
    }
}