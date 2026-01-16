import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

function App() {
  const [newItemName, setNewItemName] = useState("");
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items"],
    queryFn: api.items.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.items.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setNewItemName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.items.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    createMutation.mutate(newItemName);
  };

  const mutationError = createMutation.error || deleteMutation.error;

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Propotive Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(error || mutationError) && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error?.message || mutationError?.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter item name"
              className="flex-1"
              disabled={createMutation.isPending}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </form>

          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">
              No items yet. Add one above!
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-muted rounded-md"
                >
                  <span>{item.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
