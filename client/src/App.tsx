import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";

function Dashboard() {
  const { user, logout } = useAuth();
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
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <LoginPage onSwitchToSignup={() => setShowLogin(false)} />
    ) : (
      <SignupPage onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  return <Dashboard />;
}

export default App;
