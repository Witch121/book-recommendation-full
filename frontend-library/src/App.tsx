import React from "react";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import BookRecommendation from "./components/BookRecommendation";
import Header from "./components/reuseable/header";
import Footer from "./components/reuseable/footer";
import NavBar from "./components/reuseable/navBar";
import Home from "./components/home";
import About from "./components/about";
import Profile from "./components/Profile";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import SignOut from "./components/SignOut";
import AddBook from "./components/AddBook";
import Notes from "./components/Notes";
import AddNote from "./components/AddNote"; 
import { AuthProvider } from "./components/reuseable/userInfo";
import Library from "./components/Library";
import RandomBookPage from "./components/RandomBookPage";
import AdminPage from "./components/AdminPage";


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
              <Route path="/Profile" element={<Profile />} />
              <Route path="/Library" element={<Library />}/>
              <Route path="/Notes" element={<Notes />}/>
              <Route path="/Notes/:id" element={<AddNote />} />
              <Route path="/recommendation" element={<BookRecommendation />} />
              <Route path="/randomBook" element={<RandomBookPage />} />
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
