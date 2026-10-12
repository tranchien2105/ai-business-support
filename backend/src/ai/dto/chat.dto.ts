import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageDto } from './message.dto.js';

export class ChatDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(4000)
    message: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MessageDto)
    history?: MessageDto[];
}