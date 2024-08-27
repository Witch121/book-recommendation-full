import React from 'react';
import './styles/App.css';
import { Routes, Route } from 'react-router-dom';
import BookRecommendation from './components/BookRecommendation';
import Header from './components/common/header';
import Footer from './components/common/footer';
import NavBar from './components/common/navBar';
import Home from './components/home';
import About from './components/about';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header />
      </header>
      <div className='MainSpace container-fluid'>
        <NavBar />
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recommendation" element={<BookRecommendation />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
      <div className='Footer'>
        <Footer />
      </div>
    </div>
  );
}

export default App;
