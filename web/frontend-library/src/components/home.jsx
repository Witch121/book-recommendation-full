import React from 'react';

const Home = () => {
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

      <section className="feature-section">
        <h2 className="feature-title">Why You'll Love This Site</h2>
        <ul className="feature-list">
          <li>Personalized book recommendations tailored to your taste.</li>
          <li>An extensive library of genres and authors to explore.</li>
          <li>User-friendly interface for a stress-free experience.</li>
          <li>Connect with other book lovers and share your favorites.</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
