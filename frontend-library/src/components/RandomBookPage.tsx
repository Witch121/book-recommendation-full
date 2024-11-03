import React, { useState } from "react";
import axios from "axios";
import adventureDog from "../img/AdventureDog.jpg";

// Define the type for random book information
interface BookInfo {
  title: string;
  authors: string;
  description: string;
}

function RandomBookPage() {
  const [randomBook, setRandomBook] = useState<BookInfo | null>(null);

  const handleRandomBookRecommendation = async () => {
    const url = "https://api.nytimes.com/svc/books/v3/lists.json";
    const params = {
      list: "hardcover-fiction",
      "api-key": "bI5i7JGd0r7JCyZAItGjyvcelejeH5GD",
    };

    try {
      const response = await axios.get(url, { params });
      const allBooks = response.data.results;

      if (allBooks.length > 0) {
        const randomIndex = Math.floor(Math.random() * allBooks.length);
        const randomBookInfo = allBooks[randomIndex].book_details[0];

        setRandomBook({
          title: randomBookInfo.title || "No Title Available",
          authors: randomBookInfo.author || "Unknown Author",
          description: randomBookInfo.description || "No Description Available",
        });
      } else {
        console.log("No books found.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`An error occurred while fetching books: ${error.message}`);
      } else {
        console.error("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="home-container">
      <div className="custom-container">
        <div className="custom-row reverse-flex align-items-center g-5 py-5">
          <div className="custom-col img-container">
            <img
              src={adventureDog}
              className="about_img"
              loading="lazy"
              alt="Adventurous Dog Icon"
            />
          </div>
          <div className="custom-col about text">
            {randomBook ? (
              <div className="random-book">
                <h2>Your lucky book:</h2>
                <p className="randomBookDescription">
                  <em>Title:</em> {randomBook.title}
                </p>
                <p className="randomBookDescription">
                  <em>Author(s):</em> {randomBook.authors}
                </p>
                <p className="randomBookDescription">
                  <em>Description:</em> {randomBook.description}
                </p>
              </div>
            ) : (
              <div>
                <h1 className="title">Get out of hat book!</h1>
                <p className="lead">
                  So, today is the day. You would like something to read, but your decision-making capacity isn't at its best today?
                  This is exactly the reason why we are here to help you. Press the button and find your lucky book for today!<br/>
                  <strong>And may the odds be ever in your favor!</strong>
                </p>
              </div>
            )}
            <div className="button-container">
              <button
                onClick={handleRandomBookRecommendation}
                className="btn-input"
              >
                Find The Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RandomBookPage;
