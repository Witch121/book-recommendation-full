import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './userInfo';
import { useNavigate } from 'react-router-dom';
import userIconDino from '../../img/user_icon_dino.jpg';

const UserMenu: React.FC = () => {
    const { user, userData } = useAuth();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const toggleUserMenu = () => {
        setIsOpen((prev) => !prev);
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
                            <div className="user">
                                <p className="user-icon-greeting">
                                    Hello, <br /> {userData?.username || user?.email}!
                                </p>
                            </div>
                            <ul>
                                {[
                                    { option: "Library", action: '/Library' },
                                    { option: "Logout", action: '/SignOut' },
                                ].map(({ option, action }) => (
                                    <li key={option} onClick={() => navigate(action)}>
                                        {option}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <>
                            <div>
                                <p className="user-icon-greeting">Not signed in</p>
                            </div>
                            <ul>
                                {[
                                    { option: "Signup", action: '/SignUp' },
                                    { option: "Signin", action: '/SignIn' },
                                ].map(({ option, action }) => (
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
