import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I change my password?",
    answer: "Go to Settings > Security > Change Password. Follow the prompts to update your password.",
    category: "Account"
  },
  {
    question: "How do private posts work?",
    answer: "Private posts are only visible to subscribers. Users can subscribe to access your private content.",
    category: "Posts"
  },
  {
    question: "How do I earn money?",
    answer: "You can earn through subscriptions, tips, and exclusive content. Check your earnings in Settings > Earnings.",
    category: "Earnings"
  },
  {
    question: "How do I delete my account?",
    answer: "Contact our support team to request account deletion. All your data will be permanently removed.",
    category: "Account"
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept major credit cards, debit cards, and various digital payment methods.",
    category: "Payments"
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => navigate('/settings')} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Help & Support</h1>
        </div>
      </header>

      <main className="pt-14 pb-16 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="font-medium text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                <span className="inline-block mt-2 text-sm text-sky-500">{faq.category}</span>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h2 className="font-medium mb-2">Still need help?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our support team is here to help
            </p>
            <button
              onClick={() => navigate('/settings/contact')}
              className="bg-sky-500 text-white rounded-lg px-6 py-2 hover:bg-sky-600"
            >
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 