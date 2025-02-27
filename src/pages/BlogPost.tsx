
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Post = Database['public']['Tables']['posts']['Row'];

const AuthorCard = ({
  author,
  date
}: {
  author: string;
  date: string;
}) => (
  <Card className="p-6 lg:sticky lg:top-8 shadow-md rounded-lg bg-[#1A1B1E] border-zinc-800">
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-800 mb-4 overflow-hidden">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`} 
          alt={`${author}'s avatar`} 
          className="w-full h-full object-cover" 
          loading="lazy" 
        />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-white">{author}</h3>
      <p className="text-sm text-gray-400 mb-4">Content Creator</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  </Card>
);

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    if (!slug) return;
    try {
      const { data, error } = await supabase
        .from("posts")
        .select()
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      if (data) setPost(data);
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

  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-6 text-gray-300 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 text-white">Post not found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <article className="container mx-auto px-4 py-16 max-w-6xl">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {post.category && (
              <span className="inline-block text-xs font-medium px-2 py-1 bg-blue-600/10 text-blue-400 rounded-full mb-4">
                {post.category}
              </span>
            )}
            <h1 className="text-4xl font-bold mb-8 text-white">{post.title}</h1>
            <div className="aspect-video mb-8 rounded-xl overflow-hidden shadow-md">
              <img 
                src={post.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"} 
                alt={post.title} 
                className="object-cover w-full h-full transition-transform hover:scale-105" 
                loading="lazy" 
              />
            </div>
            <div className="prose prose-lg max-w-none">
              {post.content ? formatContent(post.content) : (
                <p className="text-gray-300">No content available.</p>
              )}
            </div>
          </div>
          <aside>
            <AuthorCard 
              author={post.author || "Anonymous"} 
              date={post.date || new Date().toLocaleDateString()}
            />
          </aside>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
