import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './userInfo';
import { useNavigate } from 'react-router-dom';
import userIconDino from '../../img/user_icon_dino.jpg'

const UserMenu = () => {
    const { user, userData } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    const toggleUserMenu = () => {
        setIsOpen(!isOpen)
    };

    const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
            setIsOpen(false);
          }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

    return (
    <div className="user-menu" ref={menuRef}>
        <div className="user-icon" onClick={toggleUserMenu}>
            <img src={userIconDino} alt="User Icon" />
        </div>

        {isOpen && (
        <div className="dropdown">
            {user ? (
            <>
                <div className='user'>
                    <p className='user-icon-greeting'>
                        Hello, <br/> {userData ? userData.username : user?.email}!
                    </p>
                </div>
                <ul>
                {[
                    {option: "Library", action: '/Library'},
                    {option: "Logout", action: '/SignOut'},
                ].map(({option, action}) => (
                    <li key={option} onClick={() => navigate(action)}>
                        {option}
                    </li>
                ))}
                </ul>
            </>
        ) : (
            <>
            <div>
            <p className='user-icon-greeting'>Not signed in</p>
            </div>
            <ul>
            {[
                {option: "Signup", action: '/SignUp'},
                {option: "Signin", action: '/SignIn'},
            ].map(({option, action}) => (
                <li key={option} onClick={() => navigate(action)}>
                    {option}
                </li>
            ))}
            </ul>
            </>
        )}
        </div>
        )}
    </div>
    );
};

export default UserMenu;