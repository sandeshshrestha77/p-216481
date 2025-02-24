import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BlogCard from "@/components/BlogCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  author: string | null;
  date: string | null;
  category: string | null;
  slug: string;
  read_time: string | null;
  featured: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);

  // Fetch posts from Supabase
  const fetchPosts = useCallback(async () => {
    try {
      setUpdating(true);

      // Fetch the featured post
      const { data: featuredData, error: featuredError } = await supabase
        .from("posts")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Fetch all non-featured posts
      const { data: allPostsData, error: allPostsError } = await supabase
        .from("posts")
        .select("*")
        .neq("featured", true)
        .order("created_at", { ascending: false });

      if (featuredError && featuredError.code !== "PGRST116") throw featuredError;
      if (allPostsError) throw allPostsError;

      setFeaturedPost(featuredData || null);
      setPosts(allPostsData || []);

    } catch (error) {
      toast.error("Error loading posts");
    } finally {
      setInitialLoading(false);
      setUpdating(false);
    }
  }, []);

  // Fetch posts on component mount and listen for real-time updates
  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("posts-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, fetchPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const handleViewAll = () => setShowAllPosts(true);

  const displayedPosts = useMemo(() => (showAllPosts ? posts : posts.slice(0, 6)), [showAllPosts, posts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-6 py-20">
        {initialLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <section className="mb-20">
                <div className="relative rounded-xl overflow-hidden shadow-lg group">
                  <img 
                    src={featuredPost.image || "https://source.unsplash.com/1200x800/?technology"} 
                    alt={featuredPost.title} 
                    className="object-cover w-full h-[450px] md:h-[550px] transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
                  <div className="absolute bottom-10 left-10 text-white">
                    <span className="bg-blue-600 px-3 py-1 rounded-md text-sm font-semibold">
                      {featuredPost.category}
                    </span>
                    <h3 className="text-4xl font-bold mt-4">{featuredPost.title}</h3>
                    <p className="text-lg mt-2">{featuredPost.excerpt}</p>
                    <div className="mt-4 flex items-center gap-3 text-gray-300">
                      <span>{featuredPost.author}</span>
                      <span>•</span>
                      <span>{featuredPost.date}</span>
                      <span>•</span>
                      <span>{featuredPost.read_time} min read</span>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={() => navigate(`/blog/${featuredPost.slug}`)} 
                      className="mt-5 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      Read More
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* Latest Posts */}
            {posts.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-4xl font-extrabold">Latest Stories</h2>
                  {!showAllPosts && posts.length > 6 && (
                    <Button variant="outline" size="lg" onClick={handleViewAll} className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white">
                      View All
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedPosts.map(post => (
                    <BlogCard key={post.slug} {...post} categories={post.category ? [post.category] : []} />
                  ))}
                </div>
              </section>
            )}

            {/* No Posts Available */}
            {!updating && !featuredPost && posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No posts available.</p>
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
