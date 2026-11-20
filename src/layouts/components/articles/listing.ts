// How the article list pages (/articles/, /articles/page/N/) share out the articles.
// The newest featured article is the wide card at the top of page 1; every other article, featured or not, goes in the
// grid, newest first, `perPage` to a page. (Before, every featured article was taken out of the grid but only the first
// was shown, so /articles/why-manage-brush/ was on no list page.)
import { sortByDate } from "@/lib/utils/sortFunctions";

export function splitArticles<T extends { data: { featured?: boolean } }>(
  posts: T[],
): { featured?: T; rest: T[] } {
  const sorted = sortByDate([...posts]) as T[];
  const featured = sorted.find((p) => p.data.featured);
  return { featured, rest: featured ? sorted.filter((p) => p !== featured) : sorted };
}

/** The number of list pages: the grid articles, perPage to a page (at least one page). */
export function articlePageCount(posts: { data: { featured?: boolean } }[], perPage: number): number {
  const { rest } = splitArticles(posts);
  return Math.max(1, Math.ceil(rest.length / perPage));
}

/** The grid articles for one list page (1-based). */
export function articlesForPage<T extends { data: { featured?: boolean } }>(posts: T[], page: number, perPage: number): T[] {
  const { rest } = splitArticles(posts);
  return rest.slice((page - 1) * perPage, page * perPage);
}
