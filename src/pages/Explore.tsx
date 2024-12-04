import SearchBar from '../components/SearchBar';
import { useState } from 'react';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search..."
          />
        </div>
      </header>

      <main className="pt-20 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Try searching for people or posts</p>
          </div>
        </div>
      </main>
    </div>
  );
}