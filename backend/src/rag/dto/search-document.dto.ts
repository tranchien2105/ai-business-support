import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDocumentDto {
    @IsString()
    @IsNotEmpty()
    query: string;
}