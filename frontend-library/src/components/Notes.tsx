import React, { useState, useEffect } from "react";
import { db } from "./firebaseFolder/firebase";
import { collection, getDocs, updateDoc, arrayRemove, doc, arrayUnion, where, query } from "firebase/firestore";
import { useAuth } from "./reuseable/userInfo";

interface Note {
  content: string;
  bookTitle: string;
  bookId: string;
}

const Notes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [editMode, setEditMode] = useState<{ id: string; content: string } | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;

      const notesArray: Note[] = [];
      const booksRef = collection(db, "books");
      const userBooksQuery = query(booksRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(userBooksQuery);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.notes && Array.isArray(data.notes)) {
          data.notes.forEach((noteContent: string) => {
            notesArray.push({ content: noteContent, bookTitle: data.title, bookId: doc.id });
          });
        }
      });

      setNotes(notesArray);
    };

    fetchNotes();
  }, [user]);

  const handleDeleteNote = async (note: Note) => {
    const bookRef = doc(db, "books", note.bookId);

    try {
      await updateDoc(bookRef, {
        notes: arrayRemove(note.content), // Remove specific note content
      });
      setNotes((prevNotes) => prevNotes.filter((n) => n.content !== note.content || n.bookId !== note.bookId));
      alert("Note deleted successfully!");
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  const handleEditNote = async (note: Note) => {
    if (!editMode) return;

    const bookRef = doc(db, "books", note.bookId); // Use note.bookId directly for the book reference

    try {
      // Remove the original note content
      await updateDoc(bookRef, {
        notes: arrayRemove(note.content),
      });

      // Add the updated note content
      await updateDoc(bookRef, {
        notes: arrayUnion(editMode.content),
      });

      // Update the local state to reflect the new note content
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.bookId === note.bookId && n.content === note.content
            ? { ...n, content: editMode.content } // Update content to the new edited content
            : n
        )
      );

      setEditMode(null); // Exit edit mode
      alert("Note updated successfully!");
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note. Please try again.");
    }
};

  return (
    <div className="home-container">
      <h2>Your Notes</h2>
      <ul>
        {notes.map((note, index) => (
          <li key={index} className="noteListItem">
            {editMode && editMode.id === note.bookId ? (
              <div>
                <input
                  type="text"
                  value={editMode.content}
                  onChange={(e) => setEditMode({ ...editMode, content: e.target.value })}
                />
                <button onClick={() => handleEditNote(note)} className="btn-table">Save</button>
                <button onClick={() => setEditMode(null)} className="btn-table">Cancel</button>
              </div>
            ) : (
            <div>
              <p> <strong>"{note.content}"</strong> - {note.bookTitle}</p>
              <button onClick={() => handleDeleteNote(note)} 
                className="btn-table">
                Delete
              </button>
              <button onClick={() => setEditMode({ id: note.bookId, content: note.content })} 
                className="btn-table">
                Edit
              </button>
            </div>
          )}
        </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
