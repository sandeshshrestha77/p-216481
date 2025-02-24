import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Post {
  title: string;
  excerpt: string | null;
  image: string | null;
  author: string | null;
  date: string | null;
  category: string | null;
  slug: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPosts, setShowAllPosts] = useState(false);

  useEffect(() => {
    fetchPosts();

    // Set up realtime subscription
    const channel = supabase
      .channel('posts-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, () => {
        fetchPosts(); // Refetch posts when changes occur
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setFeaturedPost(data[0]);
        setPosts(data.slice(1));
      }
    } catch (error) {
      toast.error("Error loading posts");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle showing all posts
  const handleViewAll = () => {
    setShowAllPosts(true);
  };

  // Filter posts based on showAllPosts state
  const displayedPosts = showAllPosts ? posts : posts.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Insights for Creative Minds
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed">
              Join our community of designers, developers, and creative professionals. 
              Get weekly insights on design, technology, and business.
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-24">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-24">
                <h2 className="text-3xl font-bold mb-12 text-left">Featured Story</h2>
                <div className="bg-card rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-w-16 aspect-h-9 md:aspect-h-full">
                      <img
                        src={featuredPost.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'}
                        alt={featuredPost.title}
                        className="object-cover w-full h-full transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-12 flex flex-col justify-center">
                      <div className="flex gap-2 mb-4">
                        {featuredPost.category && (
                          <span className="text-xs font-medium px-3 py-1 bg-primary/10 rounded-full text-gray-950">
                            {featuredPost.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold mb-6">{featuredPost.title}</h3>
                      <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground mb-8">
                        <span className="font-medium">{featuredPost.author}</span>
                        <span className="mx-2">•</span>
                        <span>{featuredPost.date}</span>
                      </div>
                      <Button
                        size="lg"
                        onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                        className="self-start text-primary-foreground bg-black"
                      >
                        Read More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Latest Posts */}
            {posts.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-3xl font-bold">Latest Stories</h2>
                  {!showAllPosts && posts.length > 6 && (
                    <Button variant="outline" size="lg" onClick={handleViewAll}>
                      View All
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedPosts.map(post => (
                    <BlogCard
                      key={post.slug}
                      {...post}
                      categories={post.category ? [post.category] : []}
                    />
                  ))}
                </div>
              </div>
            )}

            {!loading && !featuredPost && posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts available.</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;