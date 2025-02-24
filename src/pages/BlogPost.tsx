import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Post {
  title: string;
  content: string | null;
  image: string | null;
  author: string | null;
  date: string | null;
  category: string | null;
  slug: string;
}

const AuthorCard = ({ author, date }: { author: string; date: string }) => (
  <Card className="p-6 lg:sticky lg:top-8">
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 overflow-hidden">
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`}
          alt={`${author}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-semibold text-lg mb-2">{author}</h3>
      <p className="text-sm text-muted-foreground mb-4">Graphic Designer</p>
      
      <div className="text-sm text-muted-foreground">
        
        
      </div>
      
    </div>
  </Card>
);

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).single();
      if (error) throw error;
      setPost(data);
    } catch (error) {
      toast.error("Error loading post");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Post not found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 bg-inherit">
            <Link to="/" className="text-primary hover:underline mb-8 inline-block">
              ← Back to all posts
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {post.category && (
                <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {post.category}
                </span>
              )}
              <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
              <div className="aspect-[16/9] mb-8 rounded-xl overflow-hidden">
                <img
                  src={post.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
                  alt={post.title}
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                />
              </div>
              <div className="prose prose-xl max-w-none dark:prose-invert">
                {post.content ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <p className="leading-relaxed mb-6">No content available.</p>
                )}
              </div>
            </div>
            <div className="lg:w-80">
              <AuthorCard author={post.author || "Anonymous"} date={post.date || new Date().toLocaleDateString()} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
