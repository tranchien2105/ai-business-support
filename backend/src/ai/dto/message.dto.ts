import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
    @IsIn(['user', 'assistant'])
    role: 'user' | 'assistant';

    @IsString()
    @IsNotEmpty()
    content: string;
}