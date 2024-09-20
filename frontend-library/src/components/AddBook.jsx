import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Papa from 'papaparse'; // For CSV parsing
import { uploadBookToFirestore } from '../firebaseFolder/firestore'; // Import Firestore logic
import { useNavigate } from 'react-router-dom'; // For navigation to home page
import { useAuth } from '../components/common/userInfo';

const AddBook = () => {

  const { user } = useAuth();

  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    genre: '',
    series_name: '',
    bond_number: 0,
    status: 'not_read',
    place: 'home',
    keywords: [],
    rating: 0,
    uid: user.uid,
  });
  const [csvData, setCsvData] = useState([]);
  const [message, setMessage] = useState(''); // Message to show on success
  const [formSubmitted, setFormSubmitted] = useState(false); // Flag to toggle form visibility
  const navigate = useNavigate(); // For navigating to the home page

  // Handle input changes for manual book addition
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'keywords') {
      setBookData((prevData) => ({
        ...prevData,
        [name]: value.split(',').map((keyword) => keyword.trim()),
      }));
    } else {
    setBookData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    }
  };

  // Handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setCsvData(results.data);
      },
    });
  };

  // Upload CSV data to Firestore
  const uploadCSVToFirestore = async () => {
    for (const row of csvData) {
      try {
        await uploadBookToFirestore({
          title: row.title,
          author: row.author,
          genre: row.genre,
          series_name: row.series_name,
          bond_number: row.bond_number ? Number(row.bond_number) : 0, // Convert bond_number to a number
          status: row.status,
          place: row.place,
          keywords: row.keywords ? row.keywords.split(',').map(keyword => keyword.trim()) : [], // Split and trim keywords
          rating: row.rating ? Number(row.rating) : 0, // Convert rating to a number
          uid: user.uid,
        });
        setMessage('CSV document was added to Firestore');
      } catch (error) {
        console.error('Error adding document:', error);
        setMessage(`Error adding document: "${error}"`);
      }
    }
    setCsvData([]);
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Upload a manually entered book to Firestore
  const addBook = async () => {
    try {
      await uploadBookToFirestore(bookData); // Call Firestore function to upload book
      setMessage(`Book "${bookData.title}" added to Firestore`);
      setFormSubmitted(true); // Hide the form after submission
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const resetForm = () => {
    setBookData({
      title: '',
      author: '',
      genre: '',
      series_name: '',
      bond_number: 0,
      status: 'not_read',
      place: 'home',
      keywords: [],
      rating: 0,
      uid: user.uid,
    });
    setFormSubmitted(false);
    setMessage('');
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div>
      {!formSubmitted ? (
        <>
          {message && <p>{message}</p>}

  <form onSubmit={(e) => e.preventDefault()} className='pure-form pure-form-stacked'>
  <fieldset>
    <legend><h2>Sign Up</h2></legend>
        <div className="pure-u-1 pure-u-md-1-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className='pure-u-23-24'
            value={bookData.title}
            onChange={handleInputChange}
            placeholder="Title"
            required
          />
        </div>
        <div className="pure-u-1 pure-u-md-1-3">
          <label htmlFor="author" className="form-label">Author</label>
          <input
            type="text"
            name="author"
            className='pure-u-23-24'
            value={bookData.author}
            onChange={handleInputChange}
            placeholder="Author"
            required
          />
          <div className="invalid-feedback">Author is required.</div>
        </div>
        <div className="pure-u-1 pure-u-md-1-3">
          <label htmlFor="genre" className="form-label">Genre</label>
          <input
            type="text"
            name="genre"
            className='pure-u-23-24'
            value={bookData.genre}
            onChange={handleInputChange}
            placeholder="Genre"
            required
          />
        </div>
        <div className="pure-u-1 pure-u-md-1-3">
          <label htmlFor="series_name" className="form-label">Series Name</label>
          <input
            type="text"
            name="series_name"
            className='pure-u-23-24'
            value={bookData.series_name}
            onChange={handleInputChange}
            placeholder="Series Name"
          />
        </div>
        <div className="pure-u-1 pure-u-md-1-3">
          <label htmlFor="bond_number" className="form-label">Bond Number</label>
          <input
            type="number"
            name="bond_number"
            className='pure-u-23-24'
            value={bookData.bond_number}
            onChange={handleInputChange}
            placeholder="Bond Number"
            min="0"
          />
        </div>
        <div className="pure-u-1 pure-u-md-1-3">
          <label htmlFor="status" className="form-label">Status</label>
          <select
            name="status"
            className='pure-u-23-24'
            value={bookData.status}
            onChange={handleInputChange}
            required
          >
            <option value="read">Read</option>
            <option value="reading">Reading</option>
            <option value="not_read">Not Read</option>
          </select>
        </div>
        <div className="pure-u-1 pure-u-md-1-3">
          <label htmlFor="place" className="form-label">Place</label>
          <input
            type="text"
            name="place"
            className='pure-u-23-24'
            value={bookData.place}
            onChange={handleInputChange}
            placeholder="Place (home or loaned)"
            required
          />
        </div>
        <div className="pure-u-1 pure-u-md-1-3">
          <label htmlFor="keywords" className="form-label">Keywords</label>
          <input
            type="text"
            name="keywords"
            className='pure-u-23-24'
            value={bookData.keywords}
            onChange={handleInputChange}
            placeholder="Keywords (comma separated)"
            required
          />
        </div>
        <div className="pure-u-1 pure-u-md-1-3">
          <label htmlFor="rating" className="form-label">Rating</label>
          <input
            type="number"
            name="rating"
            className='pure-u-23-24'
            value={bookData.rating}
            onChange={handleInputChange}
            placeholder="Rating (1-5)"
            min="1"
            max="5"
          />
        </div>

      <button type="submit" onClick={addBook} className="btn-table">
        Add Book to Library
      </button>
    </fieldset>
  </form>
    <div className='CSV_upload_container'> 
      <h2>Upload Books via CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} id='csvFileInput'/>
      <button onClick={uploadCSVToFirestore} className='btn-table'>Upload CSV to Firestore</button>
    </div>
        </>
      ) : (
        <>
          <div className="AddedBooks_message">
          <h2>{message}</h2>
          <div className='btn_signOut_row'>
            <button onClick={resetForm} className='btn-table'>Add More</button>
            <button onClick={goHome} className='btn-table'>Home</button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default AddBook;
