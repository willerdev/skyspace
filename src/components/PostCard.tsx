import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreVertical, Lock, Globe, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types/post';
import { likePost, unlikePost, addComment } from '../services/posts';
import CommentModal from './CommentModal';
import { ErrorBoundary } from './ErrorBoundary';
import { supabase } from '../lib/supabase';
import Modal from './Modal';
import { givePoints } from '../services/points';

interface PostCardProps {
  post: Post;
  onUpdate: (post: Post) => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showPointsInput, setShowPointsInput] = useState(false);
  const [pointsToGive, setPointsToGive] = useState(1);
  const [userPoints, setUserPoints] = useState<number | null>(null);

  const username = post.profile?.username || 'Unknown User';
  const likesCount = post.likes?.length || 0;
  const isLiked = post.likes?.some(like => like.user_id === user?.id) || false;

  useEffect(() => {
    if (user) {
      supabase
        .from('points_balance')
        .select('points')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          setUserPoints(data?.points ?? 0);
        });
    }
  }, [user]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost(post.id);
        onUpdate({
          ...post,
          likes: post.likes?.filter(like => like.user_id !== user?.id) || []
        });
      } else {
        const newLike = await likePost(post.id);
        onUpdate({
          ...post,
          likes: [...(post.likes || []), newLike]
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = await addComment(post.id, newComment.trim());
      onUpdate({
        ...post,
        comments: [...(post.comments || []), comment]
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSave = async () => {
    try {
      const updatedPost = {
        ...post,
        content: editedContent,
      };
      await onUpdate(updatedPost);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleGivePoints = async () => {
    if (!user || pointsToGive <= 0 || pointsToGive > (userPoints ?? 0)) return;
    
    try {
      await givePoints(post.id, pointsToGive);
      
      setUserPoints((prev) => (prev ?? 0) - pointsToGive);
      setShowPointsInput(false);
      setPointsToGive(1);
      
      onUpdate({
        ...post,
        points: (post.points || 0) + pointsToGive
      });
    } catch (error) {
      console.error('Error giving points:', error);
      alert('Failed to give points');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {username}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                <span>•</span>
                {post.privacy === 'private' ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Globe className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>
          {user?.id === post.user_id && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Edit post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-sky-500 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-gray-900 dark:text-white whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {post.media_url && (
          <div className="mt-4">
            {post.media_type === 'image' ? (
              <img
                src={post.media_url}
                alt="Post media"
                className="rounded-lg max-h-96 w-full object-cover"
              />
            ) : post.media_type === 'video' ? (
              <video
                src={post.media_url}
                controls
                className="rounded-lg max-h-96 w-full"
              />
            ) : null}
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 ${
                  isLiked ? 'text-pink-500' : ''
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>
              <button 
                onClick={() => setShowCommentModal(true)}
                className="flex items-center space-x-1"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments?.length || 0}</span>
              </button>
              <button
                onClick={() => setShowPointsInput(true)}
                className="flex items-center space-x-2 text-gray-500 hover:text-yellow-500 transition-colors"
              >
                <Gift className="w-5 h-5" />
                <span className="font-medium">{post.points || 0}</span>
              </button>
            </div>
            {userPoints !== null && (
              <span className="text-sm text-gray-500">
                Your Points: {userPoints}
              </span>
            )}
          </div>

          <ErrorBoundary>
            <CommentModal
              isOpen={showCommentModal}
              onClose={() => setShowCommentModal(false)}
              post={post}
              onComment={handleComment}
            />
          </ErrorBoundary>
        </div>
      </div>

      <Modal
        isOpen={showPointsInput}
        onClose={() => setShowPointsInput(false)}
        title="Give Points"
      >
        <div className="p-4 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
              <Gift className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Give Points to {post.profile?.username}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You have {userPoints} point(s) available
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setPointsToGive(Math.max(1, pointsToGive - 10))}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              -10
            </button>
            <input
              type="number"
              min="1"
              max={userPoints ?? 0}
              value={pointsToGive}
              onChange={(e) => setPointsToGive(parseInt(e.target.value) || 0)}
              className="w-24 px-3 py-2 text-center text-lg font-medium border rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={() => setPointsToGive(Math.min((userPoints ?? 0), pointsToGive + 10))}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              +10
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowPointsInput(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleGivePoints}
              disabled={pointsToGive <= 0 || pointsToGive > (userPoints ?? 0)}
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Give Points
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}