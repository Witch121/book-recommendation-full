import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/reuseable/userInfo';
import { collection, query, where, getDocs, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseFolder/firebase';
import EditBtnImg from '../img/edit_icon.png';
import DeleteBtnImg from '../img/delete_icon.png';
// import InfoIcon from '../img/info_icon.png';

const Library = () => {
  const { user } = useAuth(); 
  const [books, setBooks] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filter, setFilter] = useState(''); 
  const [sortBy, setSortBy] = useState('title'); 
  const [loading, setLoading] = useState(true); 
  const [confirmDelete, setConfirmDelete] = useState(false); 
  const [bookToDelete, setBookToDelete] = useState(null); 
  const [editBookId, setEditBookId] = useState(null); 
  const [updatedBook, setUpdatedBook] = useState({});

  // Fetch books for the current user from Firestore
  useEffect(() => {
    const fetchBooks = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const booksRef = collection(db, 'books');
        const q = query(booksRef, where("uid", "==", user.uid), orderBy(sortBy));
        const querySnapshot = await getDocs(q);
        const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [user, sortBy]);

  // Handle filtering the books
  const handleSearch = () => setFilter(searchTerm);

  const handleEditClick = (book) => {
    setEditBookId(book.id);
    setUpdatedBook({ ...book});
  };
  // Handle book updates
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedBook(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    try {
      const bookRef = doc(db, 'books', editBookId);
      await updateDoc(bookRef, updatedBook);
      setBooks(prevBooks =>
        prevBooks.map(book => (book.id === editBookId ? updatedBook : book))
      );
      setEditBookId(null);
    } catch (err) {
      console.error("Error updating book: ", err);
    }
  };

  // Handle book deletion
  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const bookRef = doc(db, 'books', bookToDelete.id);
      await deleteDoc(bookRef);
      setBooks(prevBooks => prevBooks.filter(b => b.id !== bookToDelete.id));
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

  // Filter books based on the search term
  const filteredBooks = books.filter((book) => {
    return (
      book.title.toLowerCase().includes(filter.toLowerCase()) ||
      book.author.toLowerCase().includes(filter.toLowerCase()) ||
      book.genre.toLowerCase().includes(filter.toLowerCase()) ||
      (Array.isArray(book.keywords) && book.keywords.some(keyword => keyword.toLowerCase().includes(filter.toLowerCase()))) ||
      book.place.toLowerCase().includes(filter.toLowerCase()) ||
      book.status.toLowerCase().includes(filter.toLowerCase()) ||
      book.rating === Number(filter) ||
      book.series_name.toLowerCase().includes(filter.toLowerCase())
    );
  });

  return (
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
            {[
              { label: "Title", tooltip: "What’s the title? Keep it official!" },
              { label: "Author", tooltip: "Who’s the author? Google if you're stumped!" },
              { label: "Genre", tooltip: "What’s the genre? Fantasy, romance, mystery… pick one!" },
              { label: "Place", tooltip: "Where’s the book now? Phone, home, friend’s place?" },
              { label: "Status", tooltip: "Your status: Read, reading, or still on the list?" },
              { label: "Rating", tooltip: "Rate it 1-5… no pressure, just perfection!" },
              { label: "Serie", tooltip: "Is this part of a series? You’re in for the long haul!" },
              { label: "Keywords", tooltip: "Describe the plot in 3 words. Challenge accepted?" },
            ].map(({ label, tooltip }) => (
              <th key={label} className="tooltips">
                {label}
                {/* <img src={InfoIcon} alt="info icon" className="infoIconImg" /> */}
                <span className="tooltip-text">{tooltip}</span>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map(book => (
            <tr key={book.id}>
              {["title", "author", "genre", "location", "status", "rating", "series_name", "keywords"].map(field => (
                <td key={field}>
                  {editBookId === book.id ? (
                    field === "status" ? (
                      <select name="status" value={updatedBook.status} onChange={handleInputChange}>
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
                        value={updatedBook[field] || book[field]}
                        onChange={handleInputChange}
                        min={field === "rating" ? "0" : undefined}
                        max={field === "rating" ? "5" : undefined}
                      />
                    )
                  ) : (
                    field === "series_name"  ? (
                      book.series_name && !isNaN(book.bond_number) && book.bond_number > 0 ? (
                        `${book.series_name} (#${book.bond_number})`
                      ) : (
                        'Not part of a series'
                      )
                    ) : (
                      field === "keywords"
                        ? Array.isArray(book[field]) ? book[field].join(', ') : 'N/A'
                        : book[field]
                    )
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
                      <span className="tooltip-text-btn">Edit</span>
                    </button>
                    <button onClick={() => handleDeleteClick(book)} className="btn-table img">
                      <img src={DeleteBtnImg} alt="delete button" className="table-img-btn" />
                      <span className="tooltip-text-btn">Delete</span>
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
  );
};

export default Library;
