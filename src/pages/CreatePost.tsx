import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Image, Video, Loader, Lock, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MediaType, Privacy } from '../types/post';
import { createPost } from '../services/posts';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (file.type.startsWith('image/')) {
      setMediaType('image');
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
      // Check video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        if (video.duration > 15) {
          alert('Video must be 15 seconds or less');
          return;
        }
      };
      video.src = URL.createObjectURL(file);
    } else {
      alert('Unsupported file type');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setMediaPreview(preview);
    setMediaFile(file);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaType(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      await createPost(content, privacy, user.id);
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Create Post</h1>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() && !mediaFile || isLoading}
            className="px-4 py-1.5 bg-sky-500 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-600"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Post'}
          </button>
        </div>
      </header>

      <main className="pt-14 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4 py-2">
              <button
                type="button"
                onClick={() => setPrivacy(privacy === 'public' ? 'private' : 'public')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  privacy === 'private'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-transparent text-gray-600 dark:text-gray-400'
                }`}
              >
                {privacy === 'private' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 min-h-[150px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />

            {mediaPreview && (
              <div className="relative">
                {mediaType === 'image' && (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full rounded-lg"
                  />
                )}
                {mediaType === 'video' && (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-2 right-2 p-1 bg-gray-900/70 rounded-full text-white hover:bg-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Image className="w-5 h-5" />
                Image
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Video className="w-5 h-5" />
                Video
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}