import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../components/reuseable/userInfo";

function BookRecommendation() {
  const { user, loading: userLoading } = useAuth();
  const [bookName, setBookName] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBookInputChange = (e) => {
    setBookName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requestData = { 
      book_name: bookName, 
      user_id: user.uid
    };
    
    try {
      const { data } = await axios.post("http://localhost:5000/api/", requestData);
      console.log('Recommendations received from server:', data);
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error.response ? error.response.data : error.message);
    }

    setLoading(false);
  };

  if (userLoading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>Please log in to get book recommendations</div>;
  }

  return (
    <div className="recommendation-container">
      <section className="booklist-section">
        <label htmlFor="book_name" className="form-label">Enter the book name:</label>
        <form onSubmit={handleSubmit} className="booklist-form">
          <input
            type="text"
            id="book_name"
            value={bookName}
            onChange={handleBookInputChange}
            required
          />
          <button type="submit" className="btn-input recommendBooks-btn">
            Get Recommendations
          </button>
        </form>
      </section>

      {loading && <div>Loading recommendations...</div>}

      {recommendations.length > 0 && (
        <div className="booklist">
          <h2>Books recommended for you:</h2>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index} className="recommendBooksList">
                <strong>{rec.title}</strong> by {Array.isArray(rec.authors) ? rec.authors.join(', ') : "Unknown Author"} <br />
                <strong>Average Rating:</strong> {rec.averageRating} <br />
                <strong>Predicted Rating:</strong> {rec.predictedRating} <br />
                <strong>Ratings Count:</strong> {rec.ratingsCount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default BookRecommendation;
