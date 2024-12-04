import { Image } from 'lucide-react';
import { Privacy } from '../types/post';
import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, privacy: Privacy, mediaUrl?: string) => Promise<void>;
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      let mediaUrl;
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, selectedImage);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
          
        mediaUrl = publicUrl;
      }
      
      await onSubmit(content, privacy, mediaUrl);
      setContent('');
      setPrivacy('public');
      setSelectedImage(null);
      setImagePreview(null);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 md:flex md:items-center md:justify-center ${
        isOpen ? 'visible' : 'invisible'
      }`}
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="fixed inset-0 md:relative md:max-w-lg w-full bg-white dark:bg-gray-800 md:rounded-lg shadow-xl">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold">Create Post</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:border-gray-600"
            />
            
            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sky-500 hover:text-sky-600"
              >
                <Image className="w-6 h-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedImage(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as Privacy)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="w-full py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 