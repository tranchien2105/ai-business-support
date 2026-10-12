import {
    Body,
    Controller,
    Post,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AiService } from './ai.service.js';
import { ChatDto } from './dto/chat.dto.js';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    async chat(
        @Body() dto: ChatDto,
        @Res() res: Response,
    ) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        await this.aiService.chat(
            dto.message,
            dto.history ?? [],
            (content) => {
                res.write(content);
            },
        );

        res.end();
    }
}