import { Image, Lock, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import { Privacy } from '../types/post';
import { useState } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, privacy: Privacy) => Promise<void>;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await onSubmit(content.trim(), privacy);
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user?.user_metadata?.username?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <div className="font-medium">{user?.user_metadata?.username}</div>
            <button
              type="button"
              onClick={() => setPrivacy(privacy === 'public' ? 'private' : 'public')}
              className="flex items-center space-x-1 text-sm text-gray-500"
            >
              {privacy === 'public' ? (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Private</span>
                </>
              )}
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
        />

        <div className="flex justify-between items-center">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Image className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={!content.trim()}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </form>
    </Modal>
  );
} 