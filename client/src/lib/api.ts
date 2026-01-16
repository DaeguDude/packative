import { Item, User, BlogPost, LikeResponse, ApiResponse, isApiError } from "@shared/types/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Re-export types for convenience
export type { Item, User, BlogPost, LikeResponse };

async function handleResponse<T>(response: Response): Promise<T> {
  const json: ApiResponse<T> = await response.json();

  if (isApiError(json)) {
    throw new Error(json.error.message);
  }

  return json.data;
}

// Fetch with credentials (cookies)
function fetchWithCredentials(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export const api = {
  auth: {
    login: async (
      email: string,
      password: string
    ): Promise<{ user: User }> => {
      const response = await fetchWithCredentials(`${API_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return handleResponse<{ user: User }>(response);
    },

    signup: async (
      email: string,
      name: string,
      password: string
    ): Promise<{ user: User }> => {
      const response = await fetchWithCredentials(
        `${API_URL}/api/auth/signup`,
        {
          method: "POST",
          body: JSON.stringify({ email, name, password }),
        }
      );
      return handleResponse<{ user: User }>(response);
    },

    logout: async (): Promise<void> => {
      const response = await fetchWithCredentials(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
        }
      );
      await handleResponse<null>(response);
    },

    me: async (): Promise<User> => {
      const response = await fetchWithCredentials(`${API_URL}/api/auth/me`);
      return handleResponse<User>(response);
    },
  },

  items: {
    getAll: async (): Promise<Item[]> => {
      const response = await fetchWithCredentials(`${API_URL}/api/items`);
      return handleResponse<Item[]>(response);
    },

    getById: async (id: number): Promise<Item> => {
      const response = await fetchWithCredentials(`${API_URL}/api/items/${id}`);
      return handleResponse<Item>(response);
    },

    create: async (name: string): Promise<Item> => {
      const response = await fetchWithCredentials(`${API_URL}/api/items`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      return handleResponse<Item>(response);
    },

    update: async (id: number, name: string): Promise<Item> => {
      const response = await fetchWithCredentials(`${API_URL}/api/items/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      return handleResponse<Item>(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetchWithCredentials(`${API_URL}/api/items/${id}`, {
        method: "DELETE",
      });
      await handleResponse<null>(response);
    },
  },

  posts: {
    getAll: async (): Promise<BlogPost[]> => {
      const response = await fetchWithCredentials(`${API_URL}/api/posts`);
      return handleResponse<BlogPost[]>(response);
    },

    create: async (title: string, content: string): Promise<BlogPost> => {
      const response = await fetchWithCredentials(`${API_URL}/api/posts`, {
        method: "POST",
        body: JSON.stringify({ title, content }),
      });
      return handleResponse<BlogPost>(response);
    },

    like: async (id: number): Promise<LikeResponse> => {
      const response = await fetchWithCredentials(`${API_URL}/api/posts/${id}/like`, {
        method: "PATCH",
      });
      return handleResponse<LikeResponse>(response);
    },
  },
};
