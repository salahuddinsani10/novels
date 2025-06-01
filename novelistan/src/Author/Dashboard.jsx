import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, PlusCircle, Library, Edit, Trash2, BookOpen, Sparkles, ChevronRight, Clock, Lightbulb } from 'lucide-react';

const DashboardCard = ({ to, icon: Icon, title, description, color, accent = false }) => (
  <Link 
    to={to} 
    className={`p-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex flex-col items-center gap-4 group 
      ${accent ? 'bg-yellow-500 dark:bg-yellow-800 border-2 border-yellow-300 dark:border-yellow-600' : 'bg-white dark:bg-gray-800 border border-yellow-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600'}`}
  >
    <div className={`p-4 ${accent ? 'bg-yellow-400 dark:bg-yellow-700' : 'bg-yellow-100 dark:bg-gray-700'} rounded-full shadow-md`}>
      <Icon className="w-8 h-8 text-yellow-700 dark:text-yellow-300 group-hover:scale-110 transition-transform duration-300" />
    </div>
    <h3 className={`text-xl font-semibold ${accent ? 'text-white dark:text-white' : 'text-yellow-800 dark:text-yellow-200'}`}>{title}</h3>
    <p className={`text-sm text-center ${accent ? 'text-yellow-100 dark:text-yellow-200' : 'text-gray-600 dark:text-gray-300'}`}>{description}</p>
    <div className="mt-2 flex items-center text-xs font-medium ${accent ? 'text-yellow-200 dark:text-yellow-300' : 'text-yellow-600 dark:text-yellow-500'}">
      <span>Get started</span>
      <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 12,
    publishedBooks: 8,
    drafts: 4,
    recentReviews: 5
  });
  
  const cards = [
    {
      to: "add-book",
      icon: PlusCircle,
      title: "Add New Book",
      description: "Create a new book in your collection",
      accent: true
    },
    {
      to: "view-books",
      icon: Library,
      title: "View Books",
      description: "Browse and search your entire collection"
    },
    {
      to: "creative-tools",
      icon: Lightbulb,
      title: "Creative Tools",
      description: "Get AI-powered writing assistance and book cover ideas"
    },
    {
      to: "update-book",
      icon: Edit,
      title: "Update Book",
      description: "Modify details of existing books"
    },
    {
      to: "delete-book",
      icon: Trash2,
      title: "Delete Book",
      description: "Remove books from your collection"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-200 dark:bg-yellow-800/30 rounded-full">
              <Book className="w-7 h-7 text-yellow-700 dark:text-yellow-300" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">Author Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your books and published content</p>
            </div>
          </div>
          <Link to="/profile" className="px-4 py-2 bg-yellow-500 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-600 transition-colors">
            View Profile
          </Link>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-yellow-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Books</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalBooks}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-yellow-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Published</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.publishedBooks}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-yellow-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Edit className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Drafts</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.drafts}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-yellow-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Recent Reviews</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.recentReviews}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-6">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <DashboardCard key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;