import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/common/userInfo';
import { collection, query, where, getDocs, orderBy, updateDoc, doc, deleteDoc} from 'firebase/firestore';
import { db } from '../firebaseFolder/firebase';
import EditBtnImg from '../img/edit_icon.png';
import DeleteBtnImg from '../img/delete_icon.png';

const Library = () => {
    const { user } = useAuth();  // Get the authenticated user
    const [books, setBooks] = useState([]);  // Store user's books
    const [searchTerm, setSearchTerm] = useState('');  // Store the input value (what user types)
    const [filter, setFilter] = useState('');  // Store the applied filter value after clicking search
    const [sortBy, setSortBy] = useState('title');  // Default sorting by title
    const [loading, setLoading] = useState(true);  // Handle loading state
    const [confirmDelete, setConfirmDelete] = useState(false);  // Track confirmation for deletion
    const [bookToDelete, setBookToDelete] = useState(null);  // Track which book to delete
    const [editBookId, setEditBookId] = useState(null);  // Track the book being edited
    const [updatedBook, setUpdatedBook] = useState({});  // Store updated book info

    useEffect(() => {
      if (user) {
        const fetchBooks = async () => {
          setLoading(true);
          const booksRef = collection(db, 'books');

          const q = query(
            booksRef,
            where("uid", "==", user.uid),
            orderBy(sortBy)
          );
  
          try {
            const querySnapshot = await getDocs(q);
            const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBooks(booksData);
            setLoading(false);
          } catch (error) {
            console.error("Error fetching books: ", error);
            setLoading(false);
          }
        };
  
        fetchBooks();
      }
    }, [user, sortBy]); //
  
    const handleSearch = () => {
      setFilter(searchTerm);
    };

    const handleEditClick = (book) => {
        setEditBookId(book.id);
        setUpdatedBook({ ...book});
    };

    const handleInputChange = (e) => {
        const { name, value} = e.target;
        setUpdatedBook(prev => ({ ...prev, [name]: value}));
    };

    const handleSaveClick = async () => {
      try {
        const bookRef = doc(db, 'books', editBookId);
        await updateDoc(bookRef, updatedBook);
        setBooks((prevBooks) =>
          prevBooks.map((book) => (book.id === editBookId ? updatedBook : book))
        );
        setEditBookId(null);
      } catch (err) {
        console.error("Error updating book: ", err);
      }
    };

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
            alert("Book deleted successfully!")
        } catch (err) {
            console.error("Error deleting book: ", err);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDelete(false);
        setBookToDelete(null);
    };

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
      <div className='library_table'>
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
        <table className="library_table pure-table pure-table-horizontal">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>Place</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Series</th>
              <th>Keywords</th>
              <th> </th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map(book => (
              <tr key={book.id}>
            <td>
              {editBookId === book.id ? (
                <input 
                  type="text" 
                  name="title" 
                  value={updatedBook.title} 
                  onChange={handleInputChange}
                />
              ) : (
                book.title
              )}
            </td>
            <td>
              {editBookId === book.id ? (
                <input 
                  type="text" 
                  name="author" 
                  value={updatedBook.author} 
                  onChange={handleInputChange}
                />
              ) : (
                book.author
              )}
            </td>
            <td>
              {editBookId === book.id ? (
                <input 
                  type="text" 
                  name="genre" 
                  value={updatedBook.genre} 
                  onChange={handleInputChange}
                />
              ) : (
                book.genre
              )}
            </td>
            <td>
              {editBookId === book.id ? (
                <input 
                  type="text" 
                  name="place" 
                  value={updatedBook.place} 
                  onChange={handleInputChange}
                />
              ) : (
                book.place
              )}
            </td>
            <td>
              {editBookId === book.id ? (
                <select 
                  name="status" 
                  value={updatedBook.status} 
                  onChange={handleInputChange}
                >
                  <option value="read">Read</option>
                  <option value="not_read">Not Read</option>
                </select>
              ) : (
                book.status
              )}
            </td>
            <td>
              {editBookId === book.id ? (
                <input 
                  type="number" 
                  name="rating" 
                  value={updatedBook.rating} 
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                />
              ) : (
                book.rating
              )}
            </td>
            <td>
              {editBookId === book.id ? (
                <input 
                  type="text" 
                  name="series_name" 
                  value={updatedBook.series_name} 
                  onChange={handleInputChange}
                />
              ) : (
                `${book.series_name} (#${book.bond_number})`
              )}
            </td>
            <td>
              {editBookId === book.id ? (
                <input 
                  type="text" 
                  name="keywords" 
                  value={updatedBook.keywords ? updatedBook.keywords.join(', ') : ''}
                  onChange={handleInputChange}
                />
              ) : (
                Array.isArray(book.keywords) ? book.keywords.join(', ') : 'N/A'
              )}
            </td>
                <td>{editBookId === book.id ? (
                    <button onClick={handleSaveClick} className='btn-table save-btn'> Save </button>
                ) : (
                  <div>
                    <button onClick={() => handleEditClick(book)} 
                    className='btn-table img'> 
                      <img src={EditBtnImg} alt='edit button' 
                      className='table-img-btn'
                      />
                    </button>
                    <button onClick={() => handleDeleteClick(book)} 
                    className='btn-table img'>
                        <img src={DeleteBtnImg} alt='delete button'
                        className='table-img-btn'
                        />
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
                <div className='btn-group pop-up'> 
                  <button onClick={handleConfirmDelete} className='btn-table'>Yes</button>
                  <button onClick={handleCancelDelete} className='btn-table' >No</button>
                </div>
            </div>
        )}
    </div>
    );
  };
  
  export default Library;
