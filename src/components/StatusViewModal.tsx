import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { Status } from '../types/status';

interface StatusViewModalProps {
  statuses: Status[];
  initialIndex: number;
  onClose: () => void;
}

export default function StatusViewModal({ statuses, initialIndex, onClose }: StatusViewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentStatus = statuses[currentIndex];

  const goToNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {currentStatus.username[0].toUpperCase()}
              </span>
            </div>
            <span className="text-white font-medium">{currentStatus.username}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="h-full flex items-center justify-center">
        <img
          src={currentStatus.imageUrl}
          alt={`${currentStatus.username}'s status`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Navigation buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className="p-2 m-2 bg-black/50 rounded-full text-white hover:bg-black/75"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        {currentIndex < statuses.length - 1 && (
          <button
            onClick={goToNext}
            className="p-2 m-2 bg-black/50 rounded-full text-white hover:bg-black/75"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Status indicators */}
      <div className="absolute top-2 left-0 right-0 flex justify-center space-x-1 px-4">
        {statuses.map((_, index) => (
          <div
            key={index}
            className={`h-0.5 flex-1 max-w-12 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}