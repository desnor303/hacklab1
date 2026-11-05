import type {
  AdminStats,
  Article,
  ArticleInput,
  ArticleQuery,
  ArticlesResponse,
  AuthResponse,
  BookmarkEntry,
  Category,
  ProgressEntry,
  User,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const TOKEN_KEY = "hacklab_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();
  let payload: { success?: boolean; data?: unknown; message?: string } | null =
    null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || `Yêu cầu thất bại (${response.status})`,
      response.status
    );
  }

  return (payload?.data ?? null) as T;
}

function buildQuery(params: ArticleQuery): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const api = {
  register(input: { name: string; email: string; password: string }) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: input,
    });
  },

  login(input: { email: string; password: string }) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: input,
    });
  },

  me() {
    return request<User>("/auth/me");
  },

  categories() {
    return request<Category[]>("/categories");
  },

  articles(params: ArticleQuery = {}) {
    return request<ArticlesResponse>(`/articles${buildQuery(params)}`);
  },

  article(slug: string) {
    return request<Article>(`/articles/${encodeURIComponent(slug)}`);
  },

  progress() {
    return request<ProgressEntry[]>("/progress");
  },

  toggleProgress(articleId: string, completed: boolean) {
    return request<{ completed: boolean }>(`/progress/${articleId}`, {
      method: "POST",
      body: { completed },
    });
  },

  bookmarks() {
    return request<BookmarkEntry[]>("/bookmarks");
  },

  toggleBookmark(articleId: string) {
    return request<{ bookmarked: boolean }>(`/bookmarks/${articleId}`, {
      method: "POST",
    });
  },

  admin: {
    stats() {
      return request<AdminStats>("/admin/stats");
    },

    articles(params: ArticleQuery = {}) {
      return request<ArticlesResponse>(`/admin/articles${buildQuery(params)}`);
    },

    article(id: string) {
      return request<Article>(`/admin/articles/${id}`);
    },

    createArticle(input: ArticleInput) {
      return request<Article>("/admin/articles", {
        method: "POST",
        body: input,
      });
    },

    updateArticle(id: string, input: ArticleInput) {
      return request<Article>(`/admin/articles/${id}`, {
        method: "PUT",
        body: input,
      });
    },

    deleteArticle(id: string) {
      return request<{ id: string }>(`/admin/articles/${id}`, {
        method: "DELETE",
      });
    },
  },
};
