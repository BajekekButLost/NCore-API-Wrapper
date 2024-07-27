export type v2SearchCategories =
    | "Movies"
    | "Series"
    | "Music"
    | "Games"
    | "Ebooks"
    | "Apps"
    | "Adult";

export default class v2Search {
    categories?: v2SearchCategories[];
    query?: string;
    page?: number;

    addCategory(category: v2SearchCategories): v2Search {
        if (!this.categories) this.categories = [];
        this.categories.push(category);
        return this;
    }

    setCategories(categories: v2SearchCategories[]): v2Search {
        this.categories = categories;
        return this;
    }

    setQuery(query: string): v2Search {
        this.query = query;
        return this;
    }

    setPage(page: number): v2Search {
        this.page = page;
        return this;
    }
}
