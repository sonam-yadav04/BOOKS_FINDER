import React, { useState, useEffect } from 'react';
import { Search, BookOpen, User, Calendar, X, Star, Filter, Loader2 } from 'lucide-react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [yearFilter, setYearFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      let url = `https://openlibrary.org/search.json?`;
      
      switch(searchType) {
        case 'title':
          url += `title=${encodeURIComponent(searchQuery)}`;
          break;
        case 'author':
          url += `author=${encodeURIComponent(searchQuery)}`;
          break;
        case 'subject':
          url += `subject=${encodeURIComponent(searchQuery)}`;
          break;
        case 'isbn':
          url += `isbn=${encodeURIComponent(searchQuery)}`;
          break;
      }
      
      if (yearFilter) {
        url += `&first_publish_year=${encodeURIComponent(yearFilter)}`;
      }
      
      if (languageFilter) {
        url += `&language=${encodeURIComponent(languageFilter)}`;
      }
      
      url += '&limit=50';
      
      const response = await fetch(url);
      const data = await response.json();
      
      setBooks(data.docs || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBooks();
    }
  };

  const getCoverUrl = (book) => {
    if (book.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    }
    return null;
  };

  const clearFilters = () => {
    setYearFilter('');
    setLanguageFilter('');
  };

  const BookCard = ({ book }) => (
    <div 
      onClick={() => setSelectedBook(book)}
      className="book-card"
    >
      <div className="book-card-image-container">
        {getCoverUrl(book) ? (
          <img 
            src={getCoverUrl(book)} 
            alt={book.title}
            className="book-card-image"
          />
        ) : (
          <BookOpen className="book-card-placeholder" />
        )}
      </div>
      <div className="book-card-content">
        <h3>{book.title}</h3>
        <p>
          {book.author_name ? book.author_name.slice(0, 2).join(', ') : 'Unknown Author'}
        </p>
        <div className="book-card-meta">
          <span>
            {book.first_publish_year || 'Year unknown'}
          </span>
          {book.ratings_average && (
            <div className="book-card-rating">
              <Star />
              <span>{book.ratings_average.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const BookModal = ({ book, onClose }) => (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Details</h2>
          <button onClick={onClose} className="modal-close-button">
            <X />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="modal-book-info">
            <div className="modal-book-cover">
              {getCoverUrl(book) ? (
                <img src={getCoverUrl(book)} alt={book.title} />
              ) : (
                <BookOpen />
              )}
            </div>
            <div className="modal-book-details">
              <h3>{book.title}</h3>
              {book.subtitle && (
                <p className="subtitle">{book.subtitle}</p>
              )}
              <div>
                {book.author_name && (
                  <div className="modal-info-item">
                    <User />
                    <div>
                      <p>Authors</p>
                      <p>{book.author_name.join(', ')}</p>
                    </div>
                  </div>
                )}
                {book.first_publish_year && (
                  <div className="modal-info-item">
                    <Calendar />
                    <div>
                      <p>First Published</p>
                      <p>{book.first_publish_year}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            {book.subject && book.subject.length > 0 && (
              <div className="modal-section">
                <h4>Subjects</h4>
                <div className="modal-subjects">
                  {book.subject.slice(0, 10).map((subject, idx) => (
                    <span key={idx} className="modal-subject">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {book.publisher && book.publisher.length > 0 && (
              <div className="modal-section">
                <h4>Publishers</h4>
                <p>{book.publisher.slice(0, 3).join(', ')}</p>
              </div>
            )}

            {book.isbn && book.isbn.length > 0 && (
              <div className="modal-section">
                <h4>ISBN</h4>
                <p className="isbn">{book.isbn[0]}</p>
              </div>
            )}

            {book.language && book.language.length > 0 && (
              <div className="modal-section">
                <h4>Languages</h4>
                <p className="languages">{book.language.join(', ')}</p>
              </div>
            )}

            {book.number_of_pages_median && (
              <div className="modal-section">
                <h4>Pages</h4>
                <p>{book.number_of_pages_median} pages</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <a
              href={`https://openlibrary.org${book.key}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen />
              View on Open Library
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="container">
      
        <div className="header">
          <div className="title-container">
            <BookOpen style={{ width: '2.5rem', height: '2.5rem', color: '#c5d95fff' }} />
            <h1>Book Finder</h1>
          </div>
          <p>Discover your next great read</p>
        </div>

       
        <div className="search-container">
          <div className="search-box">
            <div className="search-type-buttons">
              {['title', 'author', 'subject', 'isbn'].map(type => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`search-type-button ${searchType === type ? 'active' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Search by ${searchType}...`}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="filter-button"
              >
                <Filter style={{ width: '1rem', height: '1rem' }} />
                Filters
              </button>
              {(yearFilter || languageFilter) && (
                <button
                  onClick={clearFilters}
                  className="clear-filter-button"
                >
                 <i> Clear filters</i>
                </button>
              )}
            </div>

            {showFilters && (
              <div className="filter-box">
                <div>
                  <label>Year</label>
                  <input
                    type="number"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <label>Language</label>
                  <input
                    type="text"
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value.toLowerCase())}
                    placeholder="e.g., eng, spa"
                  />
                </div>
              </div>
            )}

            <button
              onClick={searchBooks}
              disabled={loading || !searchQuery.trim()}
              className="search-button"
            >
              {loading ? (
                <>
                  <Loader2 className="loader-spin" style={{ width: '1.25rem', height: '1.25rem' }} />
                  Searching...
                </>
              ) : (
                <>
                  <Search style={{ width: '1.25rem', height: '1.25rem' }} />
                  Search Books
                </>
              )}
            </button>
          </div>
        </div>

      
        {loading && (
          <div className="loading">
            <Loader2 className="loading-icon loader-spin" />
          </div>
        )}

        {!loading && hasSearched && books.length === 0 && (
          <div className="no-results">
            <BookOpen className="no-results-icon" />
            <p>No books found. Try a different search!</p>
          </div>
        )}

        {!loading && books.length > 0 && (
          <div>
            <div className="results-header">
              <p>
                Found {books.length} book{books.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="book-grid">
              {books.map((book, idx) => (
                <BookCard key={`${book.key}-${idx}`} book={book} />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedBook && <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  );
}