import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Heart, LogIn, Plus, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";

function CreatePostModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      api.posts.create(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created!");
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate({ title, content });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create Post</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
            {createMutation.error && (
              <p className="text-sm text-destructive">
                {createMutation.error.message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState<"login" | "signup" | "create" | null>(
    null
  );

  return (
    <>
      {showModal === "login" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setShowModal(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <LoginPage onSwitchToSignup={() => setShowModal("signup")} />
          </div>
        </div>
      )}

      {showModal === "signup" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setShowModal(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <SignupPage onSwitchToLogin={() => setShowModal("login")} />
          </div>
        </div>
      )}

      {showModal === "create" && (
        <CreatePostModal onClose={() => setShowModal(null)} />
      )}

      <header className="border-b">
        <div className="max-w-2xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Blog</h1>
          {user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal("create")}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground ml-2">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal("login")}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </header>
    </>
  );
}

function MyPosts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: myPosts = [], isLoading } = useQuery({
    // This should be userId
    queryKey: ["posts", user ? user.id : null],
    queryFn: api.posts.getMine,
    enabled: !!user?.id,
  });

  const likeMutation = useMutation({
    mutationFn: api.posts.like,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>My Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (myPosts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>My Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {myPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <p className="mb-3">{post.content}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => likeMutation.mutate(post.id)}
                  disabled={likeMutation.isPending}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {post._count.likes}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BlogPosts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: api.posts.getAll,
  });

  const likeMutation = useMutation({
    mutationFn: api.posts.like,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-8">
      {user && <MyPosts />}

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
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
