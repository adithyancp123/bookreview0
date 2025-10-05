import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, User, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { genres } from '../Books/BookFilters';

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() || selectedGenre !== 'all') {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (selectedGenre !== 'all') params.set('genre', selectedGenre);
      navigate(`/books?${params.toString()}`);
      setSearchTerm('');
      setSelectedGenre('all');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <BookOpen className="h-8 w-8" />
            <span className="text-xl font-bold font-serif">BookShelf</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-8 items-center space-x-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
            <select
              aria-label="Filter by genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-48 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            >
              {genres.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/books"
              className="text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
            >
              Browse Books
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{profile?.full_name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signin"
                  className="text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-500 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
            <select
              aria-label="Filter by genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            >
              {genres.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <div className="px-4 py-2 space-y-2">
            <Link
              to="/books"
              className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Books
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="block w-full text-left py-2 text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {theme === 'dark' ? (
                <span className="flex items-center space-x-2"><Sun className="h-4 w-4 text-yellow-400" /><span>Light Mode</span></span>
              ) : (
                <span className="flex items-center space-x-2"><Moon className="h-4 w-4 text-gray-700" /><span>Dark Mode</span></span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}