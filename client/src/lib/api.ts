const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Item {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  items: {
    getAll: async (): Promise<Item[]> => {
      const response = await fetch(`${API_URL}/api/items`);
      if (!response.ok) throw new Error("Failed to fetch items");
      return response.json();
    },

    getById: async (id: number): Promise<Item> => {
      const response = await fetch(`${API_URL}/api/items/${id}`);
      if (!response.ok) throw new Error("Failed to fetch item");
      return response.json();
    },

    create: async (name: string): Promise<Item> => {
      const response = await fetch(`${API_URL}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to create item");
      return response.json();
    },

    update: async (id: number, name: string): Promise<Item> => {
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to update item");
      return response.json();
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
    },
  },
};
