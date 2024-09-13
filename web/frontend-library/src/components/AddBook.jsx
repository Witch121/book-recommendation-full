import React, { useState } from 'react';
import Papa from 'papaparse'; // For CSV parsing
import { uploadBookToFirestore } from '../firebaseFolder/firestore'; // Import Firestore logic
import { useNavigate } from 'react-router-dom'; // For navigation to home page
import { useAuth } from '../components/common/userInfo';

const AddBook = () => {
  const [bookData, setBookData] = useState({
    id: '',
    title: '',
    author: '',
    genre: '',
    series_name: '',
    bond_number: 0,
    status: 'not_read',
    place: 'home',
    keywords: '',
    rating: 0,
  });
  const [csvData, setCsvData] = useState([]);
  const [message, setMessage] = useState(''); // Message to show on success
  const [formSubmitted, setFormSubmitted] = useState(false); // Flag to toggle form visibility
  const navigate = useNavigate(); // For navigating to the home page
  const { user } = useAuth();

  // Handle input changes for manual book addition
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBookData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
        // Each row is correctly split into columns, we just need to map fields
        await uploadBookToFirestore({
          id: row.id, // Assuming the CSV has correct headers
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
      } catch (error) {
        console.error('Error adding document:', error);
      }
    }
    setMessage('CSV data uploaded to Firestore');
    setCsvData([]); // Clear the CSV data after upload
  };

  // Upload a manually entered book to Firestore
  const addBook = async () => {
    try {
      await uploadBookToFirestore(bookData); // Call Firestore function to upload book
      setMessage(`Book "${bookData.title}" added to Firestore`); // Display success message
      setFormSubmitted(true); // Hide the form after submission
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const resetForm = () => {
    setBookData({
      id: '',
      title: '',
      author: '',
      genre: '',
      series_name: '',
      bond_number: 0,
      status: 'not_read',
      place: 'home',
      keywords: '',
      rating: 0,
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
          <h2>Add Book Manually</h2>
          {message && <p>{message}</p>}

          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="id"
              value={bookData.id}
              onChange={handleInputChange}
              placeholder="ID"
              required
            />
            <input
              type="text"
              name="title"
              value={bookData.title}
              onChange={handleInputChange}
              placeholder="Title"
              required
            />
            <input
              type="text"
              name="author"
              value={bookData.author}
              onChange={handleInputChange}
              placeholder="Author"
              required
            />
            <input
              type="text"
              name="genre"
              value={bookData.genre}
              onChange={handleInputChange}
              placeholder="Genre"
            />
            <input
              type="text"
              name="series_name"
              value={bookData.series_name}
              onChange={handleInputChange}
              placeholder="Series Name"
            />
            <input
              type="number"
              name="bond_number"
              value={bookData.bond_number}
              onChange={handleInputChange}
              placeholder="Bond Number"
              min="0"
            />
            <select
              name="status"
              value={bookData.status}
              onChange={handleInputChange}
            >
              <option value="read">Read</option>
              <option value="reading">Reading</option>
              <option value="not_read">Not Read</option>
            </select>
            <input
              type="text"
              name="place"
              value={bookData.place}
              onChange={handleInputChange}
              placeholder="Place (home or loaned)"
            />
            <input
              type="text"
              name="keywords"
              value={bookData.keywords}
              onChange={handleInputChange}
              placeholder="Keywords (comma separated)"
            />
            <input
              type="number"
              name="rating"
              value={bookData.rating}
              onChange={handleInputChange}
              placeholder="Rating (1-5)"
              min="1"
              max="5"
            />
            <button type="submit" onClick={addBook}>
              Add Book to Firestore
            </button>
          </form>

          <h2>Upload Books via CSV</h2>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
          <button onClick={uploadCSVToFirestore}>Upload CSV to Firestore</button>
        </>
      ) : (
        <>
          <p>{message}</p>
          <button onClick={resetForm}>Add More</button>
          <button onClick={goHome}>Home</button>
        </>
      )}
    </div>
  );
};

export default AddBook;
