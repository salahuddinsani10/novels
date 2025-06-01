import React from 'react';
import API_BASE_URL from '../config';

const BookCard = ({ book, onDownload }) => {
  const { name, genre, author, coverImage, pdfFile } = book;

  return (
    <div className="book-card">
      <img src={`${API_BASE_URL}/uploads/covers/${coverImage}`} alt={`${name} cover`} />
      <h3>{name}</h3>
      <p><strong>Genre:</strong> {genre}</p>
      <p><strong>Author:</strong> {author}</p>
      <button className="download-btn" onClick={() => onDownload(`${API_BASE_URL}/uploads/books/${pdfFile}`)}>
        Download PDF
      </button>
    </div>
  );
};

export default BookCard;
