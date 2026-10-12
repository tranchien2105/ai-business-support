import { Injectable } from '@nestjs/common';

export interface DocumentChunk {
    content: string;
    index: number;
}

@Injectable()
export class ChunkingService {
    private readonly MAX_CHUNK_SIZE = 1000;
    private readonly OVERLAP_SIZE = 150;

    split(content: string): DocumentChunk[] {
        const sections = this.splitSections(content);

        const chunks: DocumentChunk[] = [];

        for (const section of sections) {
            const sectionChunks = this.splitSection(section);

            for (const chunk of sectionChunks) {
                chunks.push({
                    content: chunk,
                    index: chunks.length,
                });
            }
        }

        return chunks;
    }

    /**
     * Split document by headings such as:
     *
     * 1. Chính sách đổi trả
     * 2. Chính sách hoàn tiền
     * 3. Chính sách vận chuyển
     */
    private splitSections(content: string): string[] {
        const normalizedContent = content.trim();

        if (!normalizedContent) {
            return [];
        }

        const sections = normalizedContent
            .split(/(?=^\d+\.\s+)/gm)
            .map((section) => section.trim())
            .filter(Boolean);

        return sections.length > 0
            ? sections
            : [normalizedContent];
    }

    /**
     * Keep a section together if possible.
     * If it is too large, split it by paragraphs.
     */
    private splitSection(section: string): string[] {
        if (section.length <= this.MAX_CHUNK_SIZE) {
            return [section];
        }

        const paragraphs = section
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);

        const chunks: string[] = [];

        let currentChunk = '';

        for (const paragraph of paragraphs) {
            // A single paragraph is already too large.
            if (paragraph.length > this.MAX_CHUNK_SIZE) {
                if (currentChunk) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }

                chunks.push(...this.splitLongParagraph(paragraph));

                continue;
            }

            const candidate = currentChunk
                ? `${currentChunk}\n\n${paragraph}`
                : paragraph;

            if (candidate.length <= this.MAX_CHUNK_SIZE) {
                currentChunk = candidate;
                continue;
            }

            if (currentChunk) {
                chunks.push(currentChunk);
            }

            currentChunk = paragraph;
        }

        if (currentChunk) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    /**
     * Split a paragraph that is larger than MAX_CHUNK_SIZE.
     *
     * Example:
     *
     * Chunk 1: characters 0 -> 1000
     * Chunk 2: characters 850 -> 1850
     *
     * The 150 characters are the overlap.
     */
    private splitLongParagraph(paragraph: string): string[] {
        const chunks: string[] = [];

        let start = 0;

        while (start < paragraph.length) {
            const end = Math.min(
                start + this.MAX_CHUNK_SIZE,
                paragraph.length,
            );

            chunks.push(paragraph.slice(start, end));

            if (end === paragraph.length) {
                break;
            }

            start = end - this.OVERLAP_SIZE;
        }

        return chunks;
    }
}