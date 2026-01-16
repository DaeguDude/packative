import { Item, ApiResponse, isApiError } from "@shared/types/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Re-export Item for convenience
export type { Item };

async function handleResponse<T>(response: Response): Promise<T> {
  const json: ApiResponse<T> = await response.json();

  if (isApiError(json)) {
    throw new Error(json.error.message);
  }

  return json.data;
}

export const api = {
  items: {
    getAll: async (): Promise<Item[]> => {
      const response = await fetch(`${API_URL}/api/items`);
      return handleResponse<Item[]>(response);
    },

    getById: async (id: number): Promise<Item> => {
      const response = await fetch(`${API_URL}/api/items/${id}`);
      return handleResponse<Item>(response);
    },

    create: async (name: string): Promise<Item> => {
      const response = await fetch(`${API_URL}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return handleResponse<Item>(response);
    },

    update: async (id: number, name: string): Promise<Item> => {
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return handleResponse<Item>(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: "DELETE",
      });
      await handleResponse<null>(response);
    },
  },
};
