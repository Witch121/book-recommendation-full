import React from 'react';
import './styles/App.css';
import { Routes, Route } from 'react-router-dom';
import BookRecommendation from './components/BookRecommendation';
import Header from './components/common/header';
import Footer from './components/common/footer';
import NavBar from './components/common/navBar';
import Home from './components/home';
import About from './components/about';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import SignOut from './components/SignOut';
import AddBook from './components/AddBook';
import { AuthProvider } from './components/common/userInfo';
import Library from './components/Library'
import AdminPage from './components/AdminPage'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <Header />
        </header>
        <div className='MainSpace container-fluid'>
          {<NavBar />}
          <div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/SignIn" element={<SignIn />} />
              <Route path="/SignUp" element={<SignUp />} />
              <Route path="/Library" element={<Library />}/>
              <Route path="/recommendation" element={<BookRecommendation />} />
              <Route path="/about" element={ <About />} />
              <Route path="/AddBook" element={<AddBook />}/>
              <Route path="/SignOut" element={<SignOut />}/>
              <Route path="/AdminPage" element={<AdminPage />}/>
            </Routes>
          </div>
        </div>
        <div className='Footer'>
          <Footer />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
