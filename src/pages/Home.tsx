import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPosts, createPost } from '../services/posts';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import ThemeToggle from '../components/ThemeToggle';
import { Post, Privacy } from '../types/post';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'posts' 
      }, () => {
        loadPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCreatePost = async (content: string, privacy: Privacy) => {
    if (!user) return;
    
    try {
      const newPost = await createPost(content, privacy, user.id);
      setPosts([newPost, ...posts]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-2xl font-bold text-sky-500">OnlyMe</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full p-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center space-x-4 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span>Create a post...</span>
          </button>

          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No posts yet. Create your first post!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onUpdate={(updatedPost) => {
                    setPosts(posts.map(p => 
                      p.id === updatedPost.id ? updatedPost : p
                    ));
                  }}
                  // Remove className prop since it's not in PostCardProps
                />
              ))}
            </div>
          )}

          <CreatePostModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreatePost}
          />
        </div>
      </main>
    </div>
  );
}