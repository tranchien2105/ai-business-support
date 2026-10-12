import { Module } from '@nestjs/common';

import { RagController } from './rag.controller.js';
import { RagService } from './rag.service.js';
import { EmbeddingService } from './embedding/embedding.service.js';
import { DocumentService } from './document/document.service.js';
import { ChunkingService } from './document/services/chunking.service.js';


@Module({
  controllers: [
    RagController,
  ],

  providers: [
    RagService,
    EmbeddingService,
    DocumentService,
    ChunkingService
  ],

  exports: [
    DocumentService,
  ],
})
export class RagModule { }