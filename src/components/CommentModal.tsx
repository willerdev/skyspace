import { useState } from 'react';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Post } from '../types/post';
import Modal from './Modal';
import { likePost, unlikePost, replyToPost } from '../services/posts';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onComment: (content: string) => Promise<void>;
}

export default function CommentModal({ isOpen, onClose, post, onComment }: CommentModalProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { user } = useAuth();

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikePost(commentId);
      } else {
        await likePost(commentId);
      }
      // Refresh comments through parent component
      await onComment('');
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !replyingTo) return;

    try {
      await replyToPost(replyingTo, newComment.trim());
      setNewComment('');
      setReplyingTo(null);
      // Refresh comments
      await onComment('');
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await onComment(newComment.trim());
      setNewComment('');
      onClose();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comments">
      <div className="space-y-4">
        <div className="max-h-96 overflow-y-auto space-y-4">
          {post.comments?.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">
                    {comment.users?.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <span className="font-medium text-sm">
                      {comment.users?.username}
                    </span>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm">
                    <button
                      onClick={() => handleLikeComment(comment.id, !!comment.likes?.some(like => like.user_id === user?.id))}
                      className="flex items-center space-x-1 text-gray-500 hover:text-pink-500"
                    >
                      <Heart className={`w-4 h-4 ${comment.likes?.some(like => like.user_id === user?.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                      <span>{comment.likes?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-sky-500"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Replies */}
              {comment.replies?.map((reply) => (
                <div key={reply.id} className="ml-10 flex space-x-3">
                  <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">
                      {reply.users?.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <span className="font-medium text-sm">
                        {reply.users?.username}
                      </span>
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Comment/Reply Form */}
        <form onSubmit={replyingTo ? handleReply : handleSubmit} className="flex items-center gap-2 pt-4 border-t">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? "Reply to comment..." : "Write a comment..."}
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="p-2 text-sky-500 disabled:text-gray-400 hover:text-sky-600"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </Modal>
  );
} 