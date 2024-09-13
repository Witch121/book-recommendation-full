import React, { useState } from 'react';
import axios from 'axios';
import bookListImg from '../img/book-happy-face.png';

function BookRecommendation() {
  const [bookName, setBookName] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);

  const handleInputChange = (e) => {
    setBookName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchClicked(true);
    axios.post('http://127.0.0.1:5000/api/recommend', { book_name: bookName })
      .then(response => {
        setRecommendations(response.data);
      })
      .catch(error => {
        console.error('There was an error making the request!', error);
      });
  };

  return (
    <div className="recommendation-container">
      {searchClicked && recommendations.length > 0 ? (
        <>
            <form onSubmit={handleSubmit} className='booklist-form'>
              <div>
                <label htmlFor="book_name" className='form-label'>Enter the book name:</label>
                <input
                  type="text"
                  id="book_name_field"
                  value={bookName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className='recommendBooks-btn btn-input'>Get Recommendations</button>
            </form>
          <div className="booklist">
            <div className='booklist-header'>
            <img src={bookListImg} className="label" id="bookList_icon" alt="book list Icon"/>
            <h2>Books suggested for you:</h2>
            </div>
            <ul className="feature-list">
              {recommendations.map((book, index) => (
                <li className='book-list' key={index} >{book}</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <section className="intro-section">
            <h1 className="intro-title">Welcome to Your Personalized Reading Guide!</h1>
            <p className="intro-text">
              Hey there, fellow book lover! We know how it feels to finish a fantastic book and immediately start wondering, 
              “What should I read next?” With so many wonderful books out there, picking the perfect one can feel a bit overwhelming, right?
            </p>
            <p className="intro-text">
              That’s exactly why we’re here to help! Just type in the name of a book and in no time, we’ll handpick a list of awesome book recommendations just for you. It’s like having your own personal book 
              concierge who knows all your likes, dislikes, and hidden reading desires!
            </p>
            <p className="intro-text">
              No more endless searching or indecisive moments. With just a few clicks, you’ll have a list of great reads that are ready to capture 
              your imagination and whisk you away on your next literary adventure.
            </p>
          </section>
          <section className="feature-section booklist-section">
            <form onSubmit={handleSubmit} className='booklist-form'>
              <div>
                <label htmlFor="book_name" className='form-label'>Enter the book name:</label>
                <input
                  type="text"
                  id="book_name_field"
                  value={bookName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className='recommendBooks-btn btn-input'>Get Recommendations</button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}

export default BookRecommendation;
