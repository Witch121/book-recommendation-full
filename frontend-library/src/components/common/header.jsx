import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import mainImg from '../../img/main_icon.jpg';
import { useAuth } from './userInfo';

const Header = () => {
  const { user, userData } = useAuth();

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
          <p className='user-info'>Hello, {userData ? userData.username : user?.email}!</p>
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