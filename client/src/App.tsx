import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Heart, LogIn } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";

function Header() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<"login" | "signup" | null>(
    null
  );

  if (showAuthModal === "login") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setShowAuthModal(null)}
          >
            X
          </Button>
          <LoginPage onSwitchToSignup={() => setShowAuthModal("signup")} />
        </div>
      </div>
    );
  }

  if (showAuthModal === "signup") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setShowAuthModal(null)}
          >
            X
          </Button>
          <SignupPage onSwitchToLogin={() => setShowAuthModal("login")} />
        </div>
      </div>
    );
  }

  return (
    <header className="border-b">
      <div className="max-w-2xl mx-auto px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Blog</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAuthModal("login")}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        )}
      </div>
    </header>
  );
}

function BlogPosts() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: api.posts.getAll,
  });

  const createMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      api.posts.create(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setTitle("");
      setContent("");
    },
  });

  const likeMutation = useMutation({
    mutationFn: api.posts.like,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate({ title, content });
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      {user && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="w-full min-h-[100px] p-3 border rounded-md bg-background"
                placeholder="Post content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Post"}
              </Button>
              {createMutation.error && (
                <p className="text-sm text-destructive">
                  {createMutation.error.message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground">Loading...</p>}
          {error && <p className="text-destructive">Error: {error.message}</p>}
          {posts.length === 0 && !isLoading && (
            <p className="text-muted-foreground">No posts yet</p>
          )}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  by {post.author.name}
                </p>
                <p className="mb-3">{post.content}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!user) {
                      toast.error("You will have to login");
                    } else {
                      likeMutation.mutate(post.id);
                    }
                  }}
                  disabled={likeMutation.isPending}
                  title={!user ? "Login to like posts" : undefined}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {post._count.likes}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header />
      <BlogPosts />
    </div>
  );
}

export default App;
