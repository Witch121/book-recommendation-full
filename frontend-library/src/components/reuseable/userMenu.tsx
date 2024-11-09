import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./userInfo";
import { useNavigate } from "react-router-dom";
import userIconAvatar1 from "../../img/avatars/avatar1.jpg";
import userIconAvatar2 from "../../img/avatars/avatar2.jpg";
import userIconAvatar3 from "../../img/avatars/avatar3.jpg";
import userIconAvatar4 from "../../img/avatars/avatar4.jpg";
import userIconAvatar5 from "../../img/avatars/avatar5.jpg";
import userIconAvatar6 from "../../img/avatars/avatar6.jpg";

const avatars = {
    avatar1: userIconAvatar1,
    avatar2: userIconAvatar2,
    avatar3: userIconAvatar3,
    avatar4: userIconAvatar4,
    avatar5: userIconAvatar5,
    avatar6: userIconAvatar6
};

type AvatarKey = keyof typeof avatars;

const UserMenu: React.FC = () => {
    const { user, userData } = useAuth();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const avatarChoice: AvatarKey = (userData?.avatar as AvatarKey) || "avatar1";
    const userAvatar = avatars[avatarChoice];

    const toggleUserMenu = () => {
        setIsOpen((prev) => !prev);
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="user-menu" ref={menuRef}>
            <div className="user-icon" onClick={toggleUserMenu}>
                <img src={userAvatar} alt="User Icon" />
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
                                {[{ option: "Profile", action: "/Profile" }, { option: "Library", action: "/Library" }, { option: "Logout", action: "/SignOut" }].map(({ option, action }) => (
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
                                {[{ option: "Signup", action: "/SignUp" }, { option: "Signin", action: "/SignIn" }].map(({ option, action }) => (
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
