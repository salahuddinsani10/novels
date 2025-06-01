import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Users, BookOpen, Award, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';

const AboutPage = () => {
  const { isDark } = useTheme();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 font-sans">
      {/* Navigation Bar - Simplified version */}
      <nav className="bg-yellow-500 dark:bg-gray-800 text-yellow-900 dark:text-yellow-200 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Book className="h-8 w-8 text-black dark:text-yellow-300" />
            <h1 className="text-2xl font-bold dark:text-yellow-300">Novelistan</h1>
          </Link>
          
          <div className="flex space-x-6 items-center">
            <Link to="/" className="hover:text-yellow-800 dark:hover:text-yellow-200">Home</Link>
            <Link to="/about" className="font-bold border-b-2 border-black dark:border-yellow-300">About</Link>
            <Link to="/contact" className="hover:text-yellow-800 dark:hover:text-yellow-200">Contact</Link>
            <Link to="/login" className="bg-black text-yellow-500 px-4 py-2 rounded-md hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-800 dark:text-yellow-300 mb-6">About Novelistan</h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            Discover the story behind our platform and our mission to connect readers and writers around the world.
          </p>
        </div>
      </header>

      {/* Our Story Section */}
      <section className="py-16 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-yellow-700 dark:text-yellow-400 mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="mb-4">
                Novelistan was born out of a passion for storytelling and a vision to create a platform where authors could share their creativity with readers worldwide. Founded in 2023, our platform aims to democratize publishing and make quality literature accessible to everyone.
              </p>
              <p className="mb-4">
                What started as a small project has grown into a vibrant community of writers, readers, and literary enthusiasts. We believe that everyone has a story to tell, and we're here to help those stories find their audience.
              </p>
              <p>
                Our AI-powered tools are designed to assist authors in crafting compelling narratives while helping readers discover content tailored to their interests. We're constantly innovating to enhance the writing and reading experience on our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-yellow-700 dark:text-yellow-400 mb-8 text-center">Our Mission</h2>
          <div className="bg-yellow-100 dark:bg-gray-700 p-8 rounded-xl shadow-lg">
            <p className="text-xl text-center text-gray-800 dark:text-gray-200 italic">
              "To empower writers and enrich readers by creating a global platform that celebrates the art of storytelling and fosters a community built on creativity, connection, and shared experiences."
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-200 dark:bg-yellow-700 p-3 rounded-full mr-4">
                  <BookOpen className="h-6 w-6 text-yellow-700 dark:text-yellow-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">For Readers</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                We strive to create an immersive reading experience with personalized recommendations, diverse content, and tools that enhance comprehension and enjoyment.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-200 dark:bg-yellow-700 p-3 rounded-full mr-4">
                  <Users className="h-6 w-6 text-yellow-700 dark:text-yellow-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">For Authors</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                We provide a supportive environment with innovative tools, constructive feedback, and opportunities to reach a global audience and monetize creative work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-yellow-700 dark:text-yellow-400 mb-12 text-center">Our Team</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4 border-4 border-yellow-300 dark:border-yellow-600">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Team Member" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">John Doe</h3>
                <p className="text-yellow-600 dark:text-yellow-400 mb-3">Founder & CEO</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Literature enthusiast with a vision to transform how stories are shared and experienced.
                </p>
              </div>
              
              {/* Team Member 2 */}
              <div className="text-center">
                <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4 border-4 border-yellow-300 dark:border-yellow-600">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Team Member" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Jane Smith</h3>
                <p className="text-yellow-600 dark:text-yellow-400 mb-3">Head of Content</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Former editor with a passion for discovering new voices and nurturing literary talent.
                </p>
              </div>
              
              {/* Team Member 3 */}
              <div className="text-center">
                <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4 border-4 border-yellow-300 dark:border-yellow-600">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Team Member" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-1">Alex Johnson</h3>
                <p className="text-yellow-600 dark:text-yellow-400 mb-3">Tech Lead</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  AI specialist focused on creating tools that enhance the writing and reading experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-yellow-700 dark:text-yellow-400 mb-6">Join Our Community</h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Be part of our growing community of readers and writers. Start your journey with Novelistan today!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md flex items-center justify-center">
              <span className="mr-2">Sign Up Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login" className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
