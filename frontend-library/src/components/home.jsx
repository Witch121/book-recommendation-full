import React, { useState } from 'react';
// import SignOutButton from './SignOut';
import bigRabbit from '../img/icons-row/big-rabbit.jpg';
import evilHystrix from '../img/icons-row/evil-hystrix.jpg';
import manyOwl from '../img/icons-row/many-owl.jpg';
import pageCat from '../img/icons-row/page-cat.jpg';
import rainCat from '../img/icons-row/rainyDays-cat.jpg';
import smileUnicorn from '../img/icons-row/smile-unicorn.jpg';

const images = [
  { src: bigRabbit, quote: "Sometimes you just need to lay on the couch and read for a couple of years" },
  { src: evilHystrix, quote: "If anyone needs me, I’ll be reading. Please don’t need me" },
  { src: manyOwl, quote: "My problem with reading books is that I get distracted… by other books" },
  { src: rainCat, quote: "When trouble strikes, head to the library. You will either be able to solve the problem, or simply have something to read as the world crashes down on you" },
  { src: pageCat, quote: "If my book is open, your mouth should be closed" },
  { src: smileUnicorn, quote: "Apparently, reading during lunch and ignoring others is considered “rude”" }
];

const Home = () => {

  const [selectedQuote, setSelectedQuote] = useState(null);

  const handleClickOutside = (e) => {
    if (e.target.className === 'quote-overlay') {
      setSelectedQuote(null); // Hide the quote when clicking outside
    }
  };
  return (
    <div className="home-container">
      <section className="intro-section">
        <h1 className="intro-title">Welcome to the Bookworms Hub!</h1>
        <p className="intro-text">
          Like many bookworms, I've often faced the challenge of choosing the next book to dive into. With so many amazing stories out there, it's easy to feel overwhelmed and stuck in the decision-making process.
        </p>
        <p className="intro-text">
          That's why I created this site—to serve as a friendly guide in these stressful moments. Think of it as having a wise librarian friend who knows your tastes, desires, and even your guilty pleasures when it comes to reading.
        </p>
        <p className="intro-text">
          I hope this application becomes your trusted companion, helping you effortlessly find your next great read without the agony of choosing among dozens of options. Happy reading!
        </p>
      </section>
      <section>
        <div className="rowImg">
          <div className="rowImg-track">
            {images.map((img, index) => (
              <div className="rowImg-item" key={index}>
                <img 
                  src={img.src} 
                  alt={`rowImg ${index}`}
                  onClick={() => setSelectedQuote(img.quote)}
                />
              </div>
            ))}
            {images.map((img, index) => (
              <div className="rowImg-item" key={index + images.length}>
                <img 
                  src={img.src} 
                  alt={`rowImg duplicate ${index}`} 
                  onClick={() => setSelectedQuote(img.quote)} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      {selectedQuote && (
        <div className="quote-overlay" onClick={handleClickOutside}>
          <div className="quote-box">
            <p>{selectedQuote}</p>
          </div>
        </div>
      )}
      {/* <section className="feature-section">
        <h2 className="feature-title">Why You'll Love This Site</h2>
        <ul className="feature-list">
          <li>Personalized book recommendations tailored to your taste.</li>
          <li>An extensive library of genres and authors to explore.</li>
          <li>User-friendly interface for a stress-free experience.</li>
          <li>Connect with other book lovers and share your favorites.</li>
        </ul>
      </section> */}
    </div>
  );
};

export default Home;
