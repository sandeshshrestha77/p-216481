
import Navbar from "./Navbar";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout, PlusCircle, FileText, LogOut } from "lucide-react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Layout className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-blue-100">Manage your blog posts and content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button 
            onClick={() => navigate("/admin")}
            variant="outline"
            className="h-24 bg-[#1A1B1E] border-2 border-zinc-800 hover:border-blue-500 hover:bg-zinc-900 transition-all shadow-xl rounded-xl flex flex-col items-center justify-center gap-2 text-white"
          >
            <FileText className="h-6 w-6 text-blue-400" />
            <span className="font-medium">View Posts</span>
          </Button>
          
          <Button 
            onClick={() => navigate("/admin/create")}
            variant="outline"
            className="h-24 bg-[#1A1B1E] border-2 border-zinc-800 hover:border-green-500 hover:bg-zinc-900 transition-all shadow-xl rounded-xl flex flex-col items-center justify-center gap-2 text-white"
          >
            <PlusCircle className="h-6 w-6 text-green-400" />
            <span className="font-medium">Create Post</span>
          </Button>
          
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="h-24 bg-[#1A1B1E] border-2 border-zinc-800 hover:border-red-500 hover:bg-zinc-900 transition-all shadow-xl rounded-xl flex flex-col items-center justify-center gap-2 text-white"
          >
            <LogOut className="h-6 w-6 text-red-400" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
