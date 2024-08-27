import React, { useState } from 'react';
import axios from 'axios';

function BookRecommendation() {
  const [bookName, setBookName] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const handleInputChange = (e) => {
    setBookName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:5000/api/recommend', { book_name: bookName })
      .then(response => {
        setRecommendations(response.data);
      })
      .catch(error => {
        console.error('There was an error making the request!', error);
      });
  };

  return (
    <div>
      <h1>Book Recommendation System</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="book_name">Enter your favorite book name:</label><br/>
        <input
          type="text"
          id="book_name"
          value={bookName}
          onChange={handleInputChange}
          required
        /><br/><br/>
        <button type="submit">Get Recommendations</button>
      </form>
      
      {recommendations.length > 0 && (
        <div>
          <h2>Books suggested for you:</h2>
          <ul>
            {recommendations.map((book, index) => (
              <li key={index}>{book}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BookRecommendation;
