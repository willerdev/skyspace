import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types/post';
import { likePost, unlikePost, addComment } from '../services/posts';
import CommentModal from './CommentModal';
import { ErrorBoundary } from './ErrorBoundary';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: Post;
  onUpdate: (post: Post) => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const username = post.profile?.username || 'Unknown User';
  const likesCount = post.likes?.length || 0;
  const isLiked = post.likes?.some(like => like.user_id === user?.id) || false;

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

  const handleComment = async (content: string) => {
    try {
      const comment = await addComment(post.id, content);
      onUpdate({
        ...post,
        comments: [...(post.comments || []), comment]
      });
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

  const handleUserClick = () => {
    navigate(`/profile/${post.user_id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div 
            onClick={handleUserClick}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {username}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
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
          <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
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
    </div>
  );
}