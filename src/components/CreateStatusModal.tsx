import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Status } from '../types/status';
import Modal from './Modal';
import { supabase } from '../lib/supabase';

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (status: Status) => void;
}

export default function CreateStatusModal({ isOpen, onClose, onCreate }: CreateStatusModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{ username: string } | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user || !imagePreview) return;
    
    setIsLoading(true);
    try {
      const status: Status = {
        id: crypto.randomUUID(),
        userId: user.id,
        username: userProfile?.username || '',
        imageUrl: imagePreview,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      };

      onCreate(status);
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating status:', error);
      alert('Failed to create status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setImagePreview(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Story">
      <div className="space-y-4">
        {imagePreview ? (
          <div className="relative aspect-square">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute top-2 right-2 p-1 bg-gray-900/70 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-sky-500 dark:hover:border-sky-400"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Click to upload an image
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!imagePreview || isLoading}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg disabled:opacity-50 hover:bg-sky-600"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Share'}
          </button>
        </div>
      </div>
    </Modal>
  );
}