import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./reuseable/userInfo";
import { db } from "./firebaseFolder/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

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

interface UserBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  keywords?: string[];
}

interface UserPreferences {
  favoriteGenres: string[];
  favoriteAuthors: string[];
  favoriteBooks: string[];
}

function BookRecommendation() {
  const { user, loading: userLoading } = useAuth();
  const [bookName, setBookName] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLibrary, setUserLibrary] = useState<UserBook[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        
        const docRef = doc(db, "users", user.uid);
        //console.log("uid: ", user.uid); // Debugging line
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserPreferences(docSnap.data() as UserPreferences);
        } else {
          console.error("No user preferences found");
        }

        const booksRef = collection(db, "books");
        const q = query(booksRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const libraryData = querySnapshot.docs.map((doc) => doc.data() as UserBook);
        setUserLibrary(libraryData);
      } catch (error) {
        console.error("Error fetching user library or preferences:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleBookInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBookName(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const requestData = { 
      book_name: bookName, 
      user_preferences: userPreferences,
      user_library: userLibrary
    };

    try {
      const { data } = await axios.post<Recommendation[]>("http://localhost:5000/api/", requestData);
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
                  
                  {rec.similarity > 80 ? (
                      <span>This book is good much for you!</span>
                  ) : (
                      <span>This book is in the grey zone: may be top and may be flop</span>
                  )}
                  <br />                  
                  {rec.categories && <span>Genre: {rec.categories.join(", ")}</span>} <br />
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
