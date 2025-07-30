import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { bibleApi, BibleVerse } from '@/services/bibleApi';
import { bibleBooks } from '@/data/bibleData';

interface BibleAppProps {
  className?: string;
}

type ViewMode = 'books' | 'chapters' | 'verses';

export const BibleApp = ({ className = "" }: BibleAppProps) => {
  const [viewMode, setViewMode] = useState('books' as ViewMode);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [verses, setVerses] = useState([] as BibleVerse[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [viewStyle, setViewStyle] = useState('grid' as 'grid' | 'list');

  const selectedBookInfo = bibleBooks.find(book => book.name === selectedBook);

  // Generate chapter numbers for selected book
  const chapters = selectedBookInfo 
    ? Array.from({ length: selectedBookInfo.chapters }, (_, i) => i + 1)
    : [];

  const loadChapter = async (book: string, chapter: number) => {
    setLoading(true);
    setError(null);
    try {
      const chapterData = await bibleApi.getChapter(book, chapter);
      setVerses(chapterData.verses);
      setSelectedChapter(chapter);
      setViewMode('verses');
    } catch (err) {
      setError('Failed to load chapter. Please try again.');
      console.error('Error loading chapter:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectBook = (bookName: string) => {
    setSelectedBook(bookName);
    setSelectedChapter(0);
    setVerses([]);
    setViewMode('chapters');
  };

  const goBack = () => {
    if (viewMode === 'verses') {
      setViewMode('chapters');
      setVerses([]);
      setSelectedChapter(0);
    } else if (viewMode === 'chapters') {
      setViewMode('books');
      setSelectedBook('');
    }
  };

  const canGoBack = viewMode !== 'books';

  // Group books by Testament
  const oldTestamentBooks = bibleBooks.filter(book => 
    ['law', 'history', 'wisdom', 'prophets'].includes(book.category)
  );
  
  const newTestamentBooks = bibleBooks.filter(book => 
    ['gospels', 'epistles', 'apocalypse'].includes(book.category)
  );

  const testamentNames = {
    'old': 'Old Testament',
    'new': 'New Testament'
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
      {/* Header */}
      <motion.div 
        className="bg-white shadow-sm border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {canGoBack && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    className="flex items-center space-x-2"
                  >
                    <span>Back</span>
                  </Button>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h1 className="text-2xl font-bold text-slate-900">Holy Bible</h1>
                {selectedBook && (
                  <p className="text-sm text-slate-600">
                    {selectedBook}
                    {selectedChapter > 0 && ` - Chapter ${selectedChapter}`}
                  </p>
                )}
              </motion.div>
            </div>
            
            {viewMode === 'verses' && (
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Button
                  variant={viewStyle === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewStyle('grid')}
                >
                  <span>Grid</span>
                </Button>
                <Button
                  variant={viewStyle === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewStyle('list')}
                >
                  <span>List</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl px-4 py-6">
        <AnimatePresence mode="wait">
          {viewMode === 'books' && (
            <motion.div
              key="books"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="space-y-6"
            >
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  Select a Book
                </h2>
                <p className="text-slate-600">
                  Choose a book from the Bible to begin reading
                </p>
              </motion.div>

              {/* Old Testament */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                    {testamentNames.old}
                  </h3>
                  <motion.div 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                    variants={staggerContainer}
                    animate="animate"
                  >
                    {oldTestamentBooks.map((book, index) => (
                      <motion.div
                        key={book.abbreviation}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => selectBook(book.name)}
                          className="h-auto p-4 flex flex-col items-center text-center hover:bg-blue-50 hover:border-blue-300 transition-colors w-full"
                        >
                          <BookOpen className="h-6 w-6 mb-2 text-blue-600" />
                          <span className="font-medium text-slate-800 text-sm">{book.name}</span>
                          <span className="text-xs text-slate-500 mt-1">{book.chapters} chapters</span>
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                </Card>
              </motion.div>

              {/* New Testament */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                    {testamentNames.new}
                  </h3>
                  <motion.div 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                    variants={staggerContainer}
                    animate="animate"
                  >
                    {newTestamentBooks.map((book, index) => (
                      <motion.div
                        key={book.abbreviation}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => selectBook(book.name)}
                          className="h-auto p-4 flex flex-col items-center text-center hover:bg-blue-50 hover:border-blue-300 transition-colors w-full"
                        >
                          <BookOpen className="h-6 w-6 mb-2 text-blue-600" />
                          <span className="font-medium text-slate-800 text-sm">{book.name}</span>
                          <span className="text-xs text-slate-500 mt-1">{book.chapters} chapters</span>
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {viewMode === 'chapters' && selectedBook && (
            <motion.div
              key="chapters"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="space-y-6"
            >
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  {selectedBook}
                </h2>
                <p className="text-slate-600">
                  Select a chapter to read
                </p>
              </motion.div>

              <Card className="p-6">
                <motion.div 
                  className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3"
                  variants={staggerContainer}
                  animate="animate"
                >
                  {chapters.map((chapter, index) => (
                    <motion.div
                      key={chapter}
                      variants={itemVariants}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => loadChapter(selectedBook, chapter)}
                        className="h-12 w-12 p-0 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors text-white"
                      >
                        {chapter}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </Card>
            </motion.div>
          )}

          {viewMode === 'verses' && (
            <motion.div
              key="verses"
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="space-y-6"
            >
              {loading ? (
                <Card className="p-8">
                  <motion.div 
                    className="flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-slate-600">Loading chapter...</span>
                  </motion.div>
                </Card>
              ) : error ? (
                <Card className="p-6 border-red-200 bg-red-50">
                  <p className="text-red-600">{error}</p>
                  <Button 
                    onClick={() => loadChapter(selectedBook, selectedChapter)}
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </Card>
              ) : (
                <Card className="p-6">
                  <motion.div 
                    className="mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-slate-800">
                      {selectedBook} - Chapter {selectedChapter}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {verses.length} verses
                    </p>
                  </motion.div>

                  {viewStyle === 'grid' ? (
                    <motion.div 
                      className="grid gap-4"
                      variants={staggerContainer}
                      animate="animate"
                    >
                      {verses.map((verse, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02 }}
                          className="bg-slate-50 rounded-lg p-4"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded min-w-[2.5rem] text-center">
                              {verse.verse}
                            </span>
                            <p className="text-slate-700 leading-relaxed flex-1">
                              {verse.text}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      variants={staggerContainer}
                      animate="animate"
                    >
                      {verses.map((verse, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="flex space-x-3 border-b border-slate-200 pb-4 last:border-b-0"
                        >
                          <span className="text-sm font-bold text-blue-600 min-w-[3rem]">
                            {verse.verse}
                          </span>
                          <p className="text-slate-700 leading-relaxed flex-1">
                            {verse.text}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 