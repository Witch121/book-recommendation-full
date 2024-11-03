import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './userInfo';
import { db } from '../firebaseFolder/firebase';
import { getDoc, doc } from 'firebase/firestore';

const NavBar = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        try {
          const rolesDocRef = doc(db, 'properties', 'roles');
          const rolesDoc = await getDoc(rolesDocRef);
          if (rolesDoc.exists()) {
            const data = rolesDoc.data();
            const adminArray = data.admin || [];
            if (adminArray.includes(user.uid)) setIsAdmin(true);
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
        }
      }
    };
    checkAdminRole();
  }, [user]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="navBar-container" ref={dropdownRef}>
      <button className="nav-toggle-btn" onClick={toggleDropdown}>
        Menu
      </button>

      <nav className={`navBar ${isDropdownOpen ? 'open' : ''}`}>
        <ul>
          {user ? (
            <>
              <li><Link to="/" className="linkNav">Home</Link></li>
              <li><Link to="/Library" className="linkNav">Library</Link></li>
              <li><Link to="/AddBook" className="linkNav">Add Book</Link></li>
              <li><Link to="/recommendation" className="linkNav">Recommendations</Link></li>
              <li><Link to="/randomBook" className="linkNav">I’m feeling Lucky</Link></li>
              <li><Link to="/about" className="linkNav">About</Link></li>
              {isAdmin && <li><Link to="/AdminPage" className="linkNav">Admin Page</Link></li>}
              <li><Link to="/SignOut" className="linkNav">Sign Out</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/" className="linkNav">Home</Link></li>
              <li><Link to="/SignIn" className="linkNav">Sign In</Link></li>
              <li><Link to="/SignUp" className="linkNav">Sign Up</Link></li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
