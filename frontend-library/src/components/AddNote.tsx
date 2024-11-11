import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebaseFolder/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

const AddNote: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // `id` is the book ID passed as a URL param
  const [note, setNote] = useState<string>("");
  const navigate = useNavigate();

  const handleAddNote = async () => {
    if (!id || note.trim() === "") return;

    const bookRef = doc(db, "books", id);

    try {
      // Update Firestore, adding the new note to the `notes` array field
      await updateDoc(bookRef, {
        notes: arrayUnion(note), // `arrayUnion` adds to the array or creates it if missing
      });
      alert("Note added successfully!");
      navigate("/library"); // Redirect back to library or notes page
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note. Please try again.");
    }
  };

  return (
    <div className="home-container">
      <h2>Add Note</h2>
      <input
        type="text"
        placeholder="Enter your note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button onClick={handleAddNote} className="btn-table">Save Note</button>
      <button onClick={() => navigate("/library")} className="btn-table">Cancel</button>
    </div>
  );
};

export default AddNote;
