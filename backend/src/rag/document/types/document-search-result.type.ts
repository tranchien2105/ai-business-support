export interface DocumentSearchResult {
    id: number;
    content: string;
    metadata: Record<string, unknown> | null;
    distance: number;
}