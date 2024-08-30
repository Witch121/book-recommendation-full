import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import mainImg from '../../img/main_icon.jpg';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseFolder/firebase';
import { useAuth } from './userInfo';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <header className="p-3 mb-3 border-bottom">
      <div className="container-fluid header-back">
        <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start header_pattern">
          <a href="/" className="d-flex align-items-center mb-2 mb-lg-0 link-body-emphasis text-decoration-none">
            <img  src={mainImg} className="label" id="head_icon" alt="Main Icon" />
          </a>
          <h1 id="titel">Bookworm`s World</h1>
          {user ? (
        <>
          <p className='user-info'>Hello, {user.displayName || user.email}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </>
      ) : (
        <p className='user-info'>Not signed in</p>
      )}
        </div>
      </div>
    </header>
  );
}

export default Header;