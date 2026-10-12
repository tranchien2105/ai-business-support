import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentDto {
    @IsString()
    @IsNotEmpty()
    content: string;
}