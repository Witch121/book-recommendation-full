import React, { useState, useEffect } from 'react';
import axios from 'axios';
import bookListImg from '../img/book-happy-face.png';
import { useAuth } from '../components/reuseable/userInfo';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseFolder/firebase';
import { functions, httpsCallable } from "../firebaseFolder/firebase"; // Adjust path accordingly

function BookRecommendation() {
  const [bookName, setBookName] = useState('');
  const [userGenres, setUserGenres] = useState('');
  const [userRatings, setUserRatings] = useState({});
  const [userKeywords, setUserKeywords] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const { user,userData, loading } = useAuth();

  useEffect(() => {
    if (user && userData) {
      const fetchBookData = async () => {
        try {
          const bookDocRef = doc(db, 'books', user.uid);
          const bookDocSnap = await getDoc(bookDocRef);

          if (bookDocSnap.exists()) {
            const bookData = bookDocSnap.data();
            setUserGenres(bookData.genres || []);
            setUserRatings(bookData.ratings || {});
            setUserKeywords(bookData.keywords || []);
          } else {
            console.log("No such book data in Firestore!");
          }
        } catch (error) {
          console.error("Error fetching book data from Firestore:", error);
        }
      };

      fetchBookData();
    }
  }, [user, userData]);

  const handleBookInputChange = (e) => {
    setBookName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSearchClicked(true);

    const requestData = {
      book_name: bookName,
      user_preferences: {
        genres: userGenres,
        ratings: userRatings,
        keywords: userKeywords
      }
    };

    const fun = httpsCallable(functions, "recommendation");

    try {
      // Call the function and pass in data
      const result = await fun(requestData);
      setRecommendations(result.data);
    } catch (error) {
      console.error("Error calling Firebase function:", error);
    }
    
    axios.post('http://127.0.0.1:5000/api/recommend', requestData)
      .then(response => {
        setRecommendations(response.data);
      })
      .catch(error => {
        console.error('There was an error making the request!', error);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to get recommendations</div>;
  }

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
                  onChange={handleBookInputChange}
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
                <li className='book-list' key={index} >
                  <strong>Title:</strong> {book.title}
                  <strong>  Author(s):</strong> {book.authors}
                </li>
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
                  onChange={handleBookInputChange}
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


