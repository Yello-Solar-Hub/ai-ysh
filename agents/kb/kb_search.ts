/**
 * Stub knowledge base search.
 * Returns a simple snippet referencing the query.
 */
export async function kb_search(query: string): Promise<string[]> {
  if (!query) return [];
  return [`Snippet sobre: ${query}`];
}
