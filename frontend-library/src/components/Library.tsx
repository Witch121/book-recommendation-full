import React, { useEffect, useState } from "react";
import { useAuth } from "./reuseable/userInfo";
import EditBtnImg from "../img/edit_icon.png";
import DeleteBtnImg from "../img/delete_icon.png";
import { db } from "./firebaseFolder/firebase";
import { collection, query, where, getDocs, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore";

// Define types for book data
interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  location?: string;
  status: string;
  rating: number;
  series_name?: string;
  bond_number?: number;
  keywords?: string[];
}

const Library: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("title");
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [editBookId, setEditBookId] = useState<string | null>(null);
  const [updatedBook, setUpdatedBook] = useState<Partial<Book>>({});

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const booksRef = collection(db, "books");
        const q = query(booksRef, where("uid", "==", user.uid), orderBy(sortBy));
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Book));
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [user, sortBy]);

  const handleSearch = () => setFilter(searchTerm);

  const handleEditClick = (book: Book) => {
    setEditBookId(book.id);
    setUpdatedBook({ ...book });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdatedBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    if (!editBookId) return;
    try {
      const bookRef = doc(db, "books", editBookId);
      await updateDoc(bookRef, updatedBook);
      setBooks((prevBooks) =>
        prevBooks.map((book) => (book.id === editBookId ? { ...book, ...updatedBook } : book))
      );
      setEditBookId(null);
    } catch (err) {
      console.error("Error updating book: ", err);
    }
  };

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      const bookRef = doc(db, "books", bookToDelete.id);
      await deleteDoc(bookRef);
      setBooks((prevBooks) => prevBooks.filter((b) => b.id !== bookToDelete.id));
      setConfirmDelete(false);
      alert("Book deleted successfully!");
    } catch (err) {
      console.error("Error deleting book: ", err);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setBookToDelete(null);
  };

  const convertToCSV = (books: Book[]) => {
    const headers = ["Title", "Author", "Genre", "Place", "Status", "Rating", "Series Name", "Keywords"];
    const rows = books.map((book) => [
      book.title,
      book.author,
      book.genre,
      book.location || "N/A",
      book.status,
      book.rating.toString(),
      book.series_name || "N/A",
      Array.isArray(book.keywords) ? book.keywords.join(", ") : "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    return encodeURI(csvContent);
  };

  const downloadCSV = () => {
    const csv = convertToCSV(books);
    const link = document.createElement("a");
    link.setAttribute("href", csv);
    link.setAttribute("download", "library_books.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBooks = books.filter((book) => {
    const lowerCaseFilter = filter.toLowerCase();
    return (
      book.title.toLowerCase().includes(lowerCaseFilter) ||
      book.author.toLowerCase().includes(lowerCaseFilter) ||
      book.genre.toLowerCase().includes(lowerCaseFilter) ||
      (Array.isArray(book.keywords) && book.keywords.some((keyword) => keyword.toLowerCase().includes(lowerCaseFilter))) ||
      (book.location && book.location.toLowerCase().includes(lowerCaseFilter)) ||
      book.status.toLowerCase().includes(lowerCaseFilter) ||
      book.rating === Number(filter) ||
      (book.series_name && book.series_name.toLowerCase().includes(lowerCaseFilter))
    );
  });

  return (
    <div className="home-container">
      <div className="library_table">
        <h2>Your Library</h2>

        <input
          type="text"
          placeholder="Filter by title, author, genre, etc."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} className="btn-table">Search</button>

        <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
          <option value="title">Sort by Title</option>
          <option value="author">Sort by Author</option>
          <option value="genre">Sort by Genre</option>
          <option value="rating">Sort by Rating</option>
          <option value="series_name">Sort by Series Name</option>
        </select>

        {loading ? (
          <p>Loading your books...</p>
        ) : (
          <table className="library_table">
            <thead>
              <tr className="showLibraryTableHead">
                {["Title", "Author", "Genre", "Place", "Status", "Rating", "Serie", "Keywords"].map((label) => (
                  <th key={label} className="tooltips">{label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  {["title", "author", "genre", "location", "status", "rating", "series_name", "keywords"].map((field) => (
                    <td key={field}>
                      {editBookId === book.id ? (
                        field === "status" ? (
                          <select name="status" value={updatedBook.status || book.status} onChange={handleInputChange}>
                            <option value="read">Read</option>
                            <option value="reading">Reading</option>
                            <option value="not read">Not Read</option>
                            <option value="to be read">To be read</option>
                            <option value="gave up">Gave up</option>
                            <option value="stuck">Stuck</option>
                          </select>
                        ) : (
                          <input
                            type={field === "rating" ? "number" : "text"}
                            name={field}
                            value={(updatedBook as any)[field as keyof Book] || (book as any)[field as keyof Book]}
                            onChange={handleInputChange}
                            min={field === "rating" ? "0" : undefined}
                            max={field === "rating" ? "5" : undefined}
                          />
                        )
                      ) : (
                        field === "series_name"
                          ? book.series_name && book.bond_number && book.bond_number > 0
                            ? `${book.series_name} (#${book.bond_number})`
                            : "Not part of a series"
                          : field === "keywords"
                            ? Array.isArray(book[field as keyof Book]) ? (book[field as keyof Book] as string[]).join(", ") : "N/A"
                            : book[field as keyof Book]
                      )}
                    </td>
                  ))}

                  <td>
                    {editBookId === book.id ? (
                      <button onClick={handleSaveClick} className="btn-table save-btn">Save</button>
                    ) : (
                      <div>
                        <button onClick={() => handleEditClick(book)} className="btn-table img">
                          <img src={EditBtnImg} alt="edit button" className="table-img-btn" />
                        </button>
                        <button onClick={() => handleDeleteClick(book)} className="btn-table img">
                          <img src={DeleteBtnImg} alt="delete button" className="table-img-btn" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {confirmDelete && (
          <div className="confirmation-popup">
            <p>Are you sure you want to delete this book?</p>
            <div className="btn-group pop-up">
              <button onClick={handleConfirmDelete} className="btn-table">Yes</button>
              <button onClick={handleCancelDelete} className="btn-table">No</button>
            </div>
          </div>
        )}
      </div>

      <button onClick={downloadCSV} className="btn-table">Download as CSV</button>
    </div>
  );
};

export default Library;
