import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OllamaService {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    async chat(
        messages: any[],
        tools?: any[],
    ) {
        const ollamaUrl =
            this.configService.get<string>(
                'OLLAMA_BASE_URL',
            );

        const model =
            this.configService.get<string>(
                'AI_MODEL',
            );

        return axios.post(
            `${ollamaUrl}/api/chat`,
            {
                model,
                messages,

                ...(tools
                    ? {
                        tools,
                    }
                    : {}),

                think: false,
                stream: false,
            },
        );
    }
}