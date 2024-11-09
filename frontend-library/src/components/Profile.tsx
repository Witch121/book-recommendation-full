import React, { useState, useEffect } from "react";
import { db } from "./firebaseFolder/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "./reuseable/userInfo";
import avatar1 from "../img/avatars/avatar1.jpg";
import avatar2 from "../img/avatars/avatar2.jpg";
import avatar3 from "../img/avatars/avatar3.jpg";
import avatar4 from "../img/avatars/avatar4.jpg";
import avatar5 from "../img/avatars/avatar5.jpg";
import avatar6 from "../img/avatars/avatar6.jpg";

interface UserPreferences {
    favoriteGenres: string[];
    favoriteAuthors: string[];
    favoriteBooks: string[];
}

interface UserProfileData {
    username: string;
    email: string;
    avatar?: string;
}

const avatars = [
    { id: "avatar1", src: avatar1 },
    { id: "avatar2", src: avatar2 },
    { id: "avatar3", src: avatar3 },
    { id: "avatar4", src: avatar4 },
    { id: "avatar5", src: avatar5 },
    { id: "avatar6", src: avatar6 },
];

function UserProfile() {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [editing, setEditing] = useState(false);
    const [genres, setGenres] = useState<string>("");
    const [authors, setAuthors] = useState<string>("");
    const [books, setBooks] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [avatar, setAvatar] = useState<string>("avatar1");
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        const fetchUserPreferences = async () => {
            if (!user) return;
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as UserPreferences & UserProfileData;
                setPreferences({
                    favoriteGenres: data.favoriteGenres || [],
                    favoriteAuthors: data.favoriteAuthors || [],
                    favoriteBooks: data.favoriteBooks || []
                });
                setUsername(data.username || "");
                setAvatar(data.avatar || "avatar1");
                setEmail(data.email || "");
                setGenres((data.favoriteGenres || []).join(", "));
                setAuthors((data.favoriteAuthors || []).join(", "));
                setBooks((data.favoriteBooks || []).join(", "));
            }
        };

        fetchUserPreferences();
    }, [user]);

    const handleAvatarChange = (avatarId: string) => {
        setAvatar(avatarId);
    };

    const handleEditClick = () => {
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setEditing(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        const userPreferences: UserPreferences = {
            favoriteGenres: genres.split(",").map(g => g.trim()),
            favoriteAuthors: authors.split(",").map(a => a.trim()),
            favoriteBooks: books.split(",").map(b => b.trim())
        };

        const userProfileData: UserProfileData = {
            username: username,
            email: email,
            avatar: avatar
        };

        try {
            await setDoc(doc(db, "users", user.uid), { ...userPreferences, ...userProfileData }, { merge: true });
            setPreferences(userPreferences);
            setEditing(false);
            window.location.reload();
            // console.log("User preferences and profile data saved successfully");
        } catch (error) {
            console.error("Error saving user preferences:", error);
        }
    };

    return (
        <div className="home-container">
            <div className="custom-container">
                <div className="custom-row reverse-flex align-items-center g-5 py-5">
                    <div className="custom-col img-container">
                        {!editing && avatar && (
                            <img
                                src={avatars.find(a => a.id === avatar)?.src}
                                alt="Profile Avatar"
                                className="about_img"
                            />
                        )}
                    </div>
                    <div className="custom-col about text">
                        <h1 className="title">Bookworm`s profile</h1>
                        <p className="lead">
                            {preferences && !editing ? (
                                <div>
                                    <p><strong>Username:</strong> {username}</p>
                                    <p><strong>Email:</strong> {email}</p>
                                    <h2>Preferences</h2>
                                    <p><strong>Favorite Genres:</strong> {preferences.favoriteGenres.join(", ")}</p>
                                    <p><strong>Favorite Authors:</strong> {preferences.favoriteAuthors.join(", ")}</p>
                                    <p><strong>Favorite Books:</strong> {preferences.favoriteBooks.join(", ")}</p>
                                    <button onClick={handleEditClick} className="btn-input">Change</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <label>
                                        Username:
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Username"
                                        />
                                    </label>
                                    <label>
                                        Avatar:
                                        <div className="avatar-selection">
                                            {avatars.map(({ id, src }, index) => (
                                                <img
                                                    key={id}
                                                    src={src}
                                                    alt={`Avatar ${id}`}
                                                    className={`avatar-option ${id === avatar ? "selected" : ""}`}
                                                    onClick={() => handleAvatarChange(id)}
                                                    style={{ 
                                                        border: id === avatar ? "0.3rem solid #3973ac" : "none" 
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </label>
                                    <label>
                                        Favorite Genres:
                                        <input
                                            type="text"
                                            value={genres}
                                            onChange={(e) => setGenres(e.target.value)}
                                            placeholder="e.g., Fantasy, Science Fiction"
                                        />
                                    </label>
                                    <label>
                                        Favorite Authors:
                                        <input
                                            type="text"
                                            value={authors}
                                            onChange={(e) => setAuthors(e.target.value)}
                                            placeholder="e.g., Isaac Asimov, J.R.R. Tolkien"
                                        />
                                    </label>
                                    <label>
                                        Favorite Books:
                                        <input
                                            type="text"
                                            value={books}
                                            onChange={(e) => setBooks(e.target.value)}
                                            placeholder="e.g., Dune, Harry Potter"
                                        />
                                    </label>
                                    <div className="btn_row">
                                        <button type="submit" className="btn-input">Save</button>
                                        {editing && (
                                            <button type="button" onClick={handleCancelEdit} className="btn-input cancel">Cancel</button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
