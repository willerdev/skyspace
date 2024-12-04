import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, UserPlus, UserMinus, MessageCircle, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPosts } from '../services/posts';
import { getFollowers, followUser, unfollowUser } from '../services/followers';
import { givePoints } from '../services/points';

import { supabase } from '../lib/supabase';
import { Post } from '../types/post';

interface ProfileData {
  username: string;
  bio: string | null;
}

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('public');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });
  const [unlockedPosts, setUnlockedPosts] = useState<Set<string>>(new Set());
  const [userPoints, setUserPoints] = useState<number>(0);

  const profileUserId = userId === 'me' ? user?.id : userId;

  useEffect(() => {
    const loadProfileData = async () => {
      if (!profileUserId) return;
      try {
        const [userPosts, userFollowers, profileInfo, pointsData] = await Promise.all([
          getUserPosts(profileUserId),
          getFollowers(profileUserId),
          supabase
            .from('profiles')
            .select('username, bio')
            .eq('id', profileUserId)
            .single(),
          supabase
            .from('points_balance')
            .select('points')
            .eq('user_id', user?.id)
            .single()
        ]);

        setPosts(userPosts);
        setProfileData(profileInfo.data);
        setUserPoints(pointsData.data?.points || 0);
        setStats({
          posts: userPosts.length,
          followers: userFollowers.length,
          following: 0
        });
        setIsFollowing(userFollowers.some(f => f.follower_id === user?.id));
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [profileUserId, user]);

  const handleFollow = async () => {
    if (!profileUserId) return;
    try {
      if (isFollowing) {
        await unfollowUser(profileUserId);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await followUser(profileUserId);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleMessage = () => {
    navigate(`/chat/${profileUserId}`);
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(currentPosts => 
      currentPosts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  };

  const handleUnlockPost = async (postId: string) => {
    if (userPoints < 10) return;
    
    try {
      await givePoints(postId, 10);
      setUnlockedPosts(prev => new Set([...prev, postId]));
      setUserPoints(prev => prev - 10);
      
      // Use handlePostUpdate to update the post in state
      const updatedPost = posts.find(p => p.id === postId);
      if (updatedPost) {
        handlePostUpdate({...updatedPost, unlocked: true});
      }
    } catch (error) {
      console.error('Error unlocking post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const filteredPosts = posts.filter(post => 
    activeTab === 'public' ? post.privacy === 'public' : post.privacy === 'private'
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {profileData?.username}'s Profile
          </h1>
          <div className="flex items-center space-x-2">
            {user?.id === profileUserId && (
              <>
                <button
                  onClick={() => navigate('/wallet')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <Wallet className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/settings')} 
                  className="p-2"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </>
            )}
            {user?.id !== profileUserId && (
              <>
                <button
                  onClick={handleMessage}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleFollow}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-14 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {profileData?.username}
              </h2>
              {profileData?.bio && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{profileData.bio}</p>
              )}
            </div>
            <div className="flex justify-around mt-6">
              <div className="text-center">
                <div className="font-semibold">{stats.posts}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{stats.followers}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{stats.following}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>
          </div>

          <div className="flex mb-4 bg-white dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 py-2 text-sm font-medium rounded ${
                activeTab === 'public'
                  ? 'bg-sky-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Public Posts
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`flex-1 py-2 text-sm font-medium rounded ${
                activeTab === 'private'
                  ? 'bg-sky-500 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Private Posts
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredPosts.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No {activeTab} posts yet
              </div>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  {post.media_url && (
                    <div className="aspect-square relative">
                      <img
                        src={post.media_url}
                        alt={post.content}
                        className={`w-full h-full object-cover ${
                          post.privacy === 'private' && !unlockedPosts.has(post.id)
                            ? 'blur-xl'
                            : ''
                        }`}
                      />
                      {post.privacy === 'private' && !unlockedPosts.has(post.id) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <button
                            onClick={() => handleUnlockPost(post.id)}
                            disabled={userPoints < 10}
                            className="px-4 py-2 bg-sky-500 text-white rounded-full disabled:opacity-50"
                          >
                            Unlock for 10 points
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}