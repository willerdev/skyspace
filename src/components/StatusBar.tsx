import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Status } from '../types/status';
import CreateStatusModal from './CreateStatusModal';
import StatusViewModal from './StatusViewModal';

export default function StatusBar() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingStatuses, setViewingStatuses] = useState<Status[] | null>(null);
  const [initialStatusIndex, setInitialStatusIndex] = useState(0);
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Status[]>(() => {
    const saved = localStorage.getItem('statuses');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    // Filter out expired statuses
    return parsed.filter((status: Status) => status.expiresAt > Date.now());
  });

  const handleStatusCreate = (status: Status) => {
    const newStatuses = [status, ...statuses];
    setStatuses(newStatuses);
    localStorage.setItem('statuses', JSON.stringify(newStatuses));
    setIsCreateModalOpen(false);
  };

  const handleStatusClick = (clickedStatus: Status) => {
    // Find all statuses from the same user
    const userStatuses = statuses.filter(
      status => status.userId === clickedStatus.userId
    );
    const statusIndex = userStatuses.findIndex(
      status => status.id === clickedStatus.id
    );
    setViewingStatuses(userStatuses);
    setInitialStatusIndex(statusIndex);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 py-2 max-w-md mx-auto">
        <div className="flex space-x-3 overflow-x-auto pb-1 scrollbar-hide">
          {/* Create status button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex flex-col items-center space-y-1 flex-shrink-0"
          >
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-sky-500 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <Plus className="w-5 h-5 text-sky-500" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Your story
            </span>
          </button>

          {/* Status items */}
          {statuses.map((status) => (
            <button
              key={status.id}
              className="flex flex-col items-center space-y-1 flex-shrink-0"
              onClick={() => handleStatusClick(status)}
            >
              <div className="w-14 h-14 rounded-full border-2 border-sky-500 p-0.5">
                <img
                  src={status.imageUrl}
                  alt={`${status.username}'s status`}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-14">
                {status.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      <CreateStatusModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleStatusCreate}
      />

      {viewingStatuses && (
        <StatusViewModal
          statuses={viewingStatuses}
          initialIndex={initialStatusIndex}
          onClose={() => setViewingStatuses(null)}
        />
      )}
    </div>
  );
}