export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order?: number;
  articleCount?: number;
}

export interface Author {
  _id?: string;
  name: string;
}

export interface ArticleSummary {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  readTime: number;
  views: number;
  featured?: boolean;
  isPublished?: boolean;
  publishedAt: string;
  category: Category;
  author?: Author;
}

export interface Article extends ArticleSummary {
  content: string;
  related?: ArticleSummary[];
}

export interface ArticlesResponse {
  items: ArticleSummary[];
  total: number;
  page: number;
  pages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProgressEntry {
  _id: string;
  completedAt: string;
  article: ArticleSummary;
}

export interface BookmarkEntry {
  _id: string;
  createdAt: string;
  article: ArticleSummary;
}

export interface AdminStats {
  users: number;
  articles: number;
  published: number;
  completions: number;
  bookmarks: number;
}

export interface ArticleInput {
  title: string;
  slug?: string;
  description: string;
  content: string;
  category: string;
  difficulty: Difficulty;
  tags: string[] | string;
  readTime?: number;
  featured?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
}

export interface ArticleQuery {
  search?: string;
  category?: string;
  difficulty?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: string;
}
