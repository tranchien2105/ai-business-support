import { Module } from '@nestjs/common';

import { RagModule } from '../rag/rag.module.js';
import { OrdersModule } from '../orders/orders.module.js';

import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

import { OllamaService } from './llm/ollama.service.js';
import { ToolPolicyService } from './policy/tool-policy.service.js';

import { OrderToolService } from './tools/order-tool.service.js';
import { ToolExecutorService } from './tools/tool-executor.service.js';

@Module({
  imports: [
    OrdersModule,
    RagModule,
  ],

  controllers: [
    AiController,
  ],

  providers: [
    AiService,

    // LLM
    OllamaService,

    // Policy
    ToolPolicyService,

    // Tools
    OrderToolService,
    ToolExecutorService,
  ],
})
export class AiModule { }