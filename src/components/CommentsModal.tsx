import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CommentData {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
  };
}

interface CommentsModalProps {
  post: {
    comments: CommentData[];
  };
  isOpen: boolean;
  onClose: () => void;
  onComment: (comment: string) => void;
}

export default function CommentsModal({ post, isOpen, onClose, onComment }: CommentsModalProps) {
  const [newComment, setNewComment] = useState('');
  const [userProfile, setUserProfile] = useState<{ username: string } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setUserProfile(data));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    onComment(newComment.trim());
    setNewComment('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comments">
      <div className="space-y-4">
        {/* Comments list */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {post.comments?.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            post.comments?.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">
                    {comment.user.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {comment.user.username}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm break-words">
                      {comment.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment form */}
        {user && userProfile && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">
                {userProfile.username[0].toUpperCase()}
              </span>
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
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
        )}
      </div>
    </Modal>
  );
}