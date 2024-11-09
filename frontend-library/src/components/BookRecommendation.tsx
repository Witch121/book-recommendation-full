import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./reuseable/userInfo";
import { db } from "./firebaseFolder/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Define the type for a recommendation
interface Recommendation {
  title: string;
  authors: string[];
  averageRating: number;
  similarity: number;
  ratingsCount: number;
  description?: string;
  categories?: string[];
  pageCount?: number;
  language?: string;
}

// Define the type for a user's library book data
interface UserBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  keywords?: string[];
}

function BookRecommendation() {
  const { user, loading: userLoading } = useAuth();
  const [bookName, setBookName] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLibrary, setUserLibrary] = useState<UserBook[]>([]);

  // Fetch user's library data from Firestore
  useEffect(() => {
    const fetchUserLibrary = async () => {
      if (!user) return;
      try {
        const booksRef = collection(db, "books");
        const q = query(booksRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const libraryData = querySnapshot.docs.map((doc) => doc.data() as UserBook);
        setUserLibrary(libraryData);
        //console.log(libraryData);
      } catch (error) {
        console.error("Error fetching user library:", error);
      }
    };

    fetchUserLibrary();
  }, [user]);

  const handleBookInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBookName(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const requestData = { 
      book_name: bookName, 
      user_id: user?.uid,
      user_library: userLibrary // Pass user library to the backend
    };

    try {
      const { data } = await axios.post<Recommendation[]>("http://localhost:5000/api/", requestData);
      console.log("Recommendations received from server:", data);
      setRecommendations(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching recommendations:", error);
      } else {
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>Please log in to get book recommendations</div>;
  }

  return (
    <div className="home-container">
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
                  <strong>{rec.title}</strong> by {Array.isArray(rec.authors) ? rec.authors.join(", ") : "Unknown Author"} <br />
                  {rec.averageRating && <span>Average Rating: {rec.averageRating}</span>} <br />
                  {rec.similarity && <span>Similarity: {rec.similarity}%</span>} <br />
                  {rec.description && <p>{rec.description}</p>}
                  {rec.categories && <span>Categories: {rec.categories.join(", ")}</span>} <br />
                  {rec.pageCount && <span>Page Count: {rec.pageCount}</span>} <br />
                  {rec.language && <span>Language: {rec.language.toUpperCase()}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookRecommendation;
