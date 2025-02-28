import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowRight, ChevronRight, Clock, User } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
type Post = Database['public']['Tables']['posts']['Row'];
const Index = () => {
  const navigate = useNavigate();
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const fetchPosts = useCallback(async () => {
    try {
      setUpdating(true);
      const [featuredResponse, postsResponse] = await Promise.all([supabase.from("posts").select().eq('featured', true).maybeSingle(), supabase.from("posts").select().eq('featured', false).order("created_at", {
        ascending: false
      })]);
      if (featuredResponse.error && featuredResponse.error.code !== 'PGRST116') {
        throw featuredResponse.error;
      }
      if (postsResponse.error) {
        throw postsResponse.error;
      }
      if (featuredResponse.data) setFeaturedPost(featuredResponse.data);
      if (postsResponse.data) setPosts(postsResponse.data);
    } catch (error) {
      toast.error("Error loading posts");
    } finally {
      setInitialLoading(false);
      setUpdating(false);
    }
  }, []);
  useEffect(() => {
    fetchPosts();
    const channel = supabase.channel("posts-channel").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "posts"
    }, fetchPosts).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);
  const handleViewAll = () => setShowAllPosts(true);
  const displayedPosts = useMemo(() => showAllPosts ? posts : posts.slice(0, 6), [showAllPosts, posts]);
  return <div className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {initialLoading ? <div className="flex items-center justify-center min-h-[70vh]">
          <LoadingSpinner />
        </div> : <>
          {/* Hero Section with Featured Post */}
          {featuredPost && <section className="relative pt-20 pb-32 overflow-hidden">
              <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                  {/* Left column - Text content */}
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-600/20 text-blue-400 border border-blue-500/20">
                      {featuredPost.category}
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                      {featuredPost.title}
                    </h1>
                    
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-6 text-gray-400 pt-2">
                      <div className="flex items-center gap-2">
                        <User size={18} />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        
                        
                      </div>
                    </div>
                    
                    <Link to={`/blog/${featuredPost.slug}`} className="inline-flex items-center py-3 px-6 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors group">
                      Read Article 
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                    </Link>
                  </div>
                  
                  {/* Right column - Featured image */}
                  <div className="w-full lg:w-1/2">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/30 aspect-[4/3]">
                      <img src={featuredPost.image || "https://source.unsplash.com/1200x800/?technology"} alt={featuredPost.title} className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decorative elements */}
              <div className="absolute top-20 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl -z-10"></div>
            </section>}

          {/* Latest Posts Section */}
          {posts.length > 0 && <section className="py-20 bg-zinc-900/30">
              <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                  <div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white">
                      Latest Stories
                    </h2>
                    <p className="mt-2 text-gray-400">
                      Discover our most recent articles and insights
                    </p>
                  </div>
                  
                  {!showAllPosts && posts.length > 6 && <Button variant="outline" onClick={handleViewAll} className="border-blue-600/40 text-blue-400 hover:bg-blue-600/10 hover:text-blue-300 transition-all">
                      View All Articles
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedPosts.map(post => <BlogCard key={post.id} {...post} categories={post.category ? [post.category] : []} />)}
                </div>
              </div>
            </section>}

          {/* CTA Section */}
          

          {!updating && !featuredPost && posts.length === 0 && <div className="text-center py-40">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-semibold text-white mb-4">
                  No Posts Available
                </h3>
                <p className="text-gray-400">
                  Check back later for new content and updates.
                </p>
              </div>
            </div>}
        </>}
      
      <Footer />
    </div>;
};
export default Index;