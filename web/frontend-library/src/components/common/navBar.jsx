import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <ul className="navBar">
      <nav>
        <Link to="/" className="linkNav">Home</Link>
        <Link to="/SignUp" className="linkNav"> Sign Up</Link>
        <Link to="/SignIn" className="linkNav"> Sign In</Link>
        {/* <Link to="/SignOut" className="linkNav">Sign Out</Link> */}
        <Link to="/recommendation" className="linkNav">Recommendations</Link>
        <Link to="/about" className="linkNav">About</Link>
      </nav>
    </ul>
  );
};

export default NavBar;
