import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Papa from 'papaparse'; // For CSV parsing
import { uploadBookToFirestore } from '../firebaseFolder/firestore'; // Import Firestore logic
import { useNavigate } from 'react-router-dom'; // For navigation to home page
import { useAuth } from '../components/reuseable/userInfo'; // Auth info

const AddBook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tooltipsText = [
    { tooltip: "What’s the title? Keep it official!" },
    { tooltip: "Who’s the author? Google if you're stumped!" },
    { tooltip: "What’s the genre? Fantasy, romance, mystery… pick one!" },
    { tooltip: "Where’s the book now? Phone, home, friend’s place?" },
    { tooltip: "Your status: Read, reading, or still on the list?" },
    { tooltip: "Rate it 1-5… no pressure, just perfection!" },
    { tooltip: "Is this part of a series? You’re in for the long haul!" },
    { tooltip: "Which book in the series? Give us the number!" },
    { tooltip: "Describe the plot in 3 words. Challenge accepted?" },
  ];

  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    genre: '',
    series_name: '',
    bond_number: 0,
    status: 'read',
    location: 'home',
    keywords: [],
    rating: 0,
    uid: user.uid,
  });
  const [csvData, setCsvData] = useState([]);
  const [message, setMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

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
          bond_number: row.bond_number ? Number(row.bond_number) : 0,
          status: row.status,
          place: row.place,
          keywords: row.keywords ? row.keywords.split(',').map(keyword => keyword.trim()) : [],
          rating: row.rating ? Number(row.rating) : 0,
          uid: user.uid,
        });
        setMessage('CSV document was added to Firestore');
      } catch (error) {
        console.error('Error adding document:', error);
        setMessage(`Error adding document: "${error}"`);
      }
    }
    setCsvData([]);
    document.getElementById('csvFileInput').value = '';
  };

  // Upload a manually entered book to Firestore
  const addBook = async () => {
    try {
      await uploadBookToFirestore(bookData);
      setMessage(`Book "${bookData.title}" added to Firestore`);
      setFormSubmitted(true);
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
      location: 'home',
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

          <form onSubmit={(e) => e.preventDefault()} className="pure-form pure-form-stacked">
            <fieldset>
              <legend><h2>Add Book</h2></legend>

              {[
                { name: "title", label: "Title", type: "text", placeholder: "Title", tooltip: tooltipsText[0].tooltip },
                { name: "author", label: "Author", type: "text", placeholder: "Author", tooltip: tooltipsText[1].tooltip },
                { name: "genre", label: "Genre", type: "text", placeholder: "Genre", tooltip: tooltipsText[2].tooltip },
                { name: "series_name", label: "Series Name", type: "text", placeholder: "Series Name", tooltip: tooltipsText[6].tooltip },
                { name: "bond_number", label: "Bond Number", type: "number", placeholder: "Bond Number", tooltip: tooltipsText[7].tooltip, min: "0" },
                { name: "location", label: "Location", type: "text", placeholder: "Location (home or loaned)", tooltip: tooltipsText[3].tooltip },
                { name: "keywords", label: "Keywords", type: "text", placeholder: "Keywords (comma separated)", tooltip: tooltipsText[8].tooltip },
                { name: "rating", label: "Rating", type: "number", placeholder: "Rating (1-5)", tooltip: tooltipsText[5].tooltip, min: "1", max: "5" }
              ].map(({ name, label, type, placeholder, tooltip, ...rest }) => (
                <div key={name} className="pure-u-1 pure-u-md-1-3">
                  <label htmlFor={name} className="form-label tooltips">
                    {label}
                    <span className="tooltip-text">{tooltip}</span>
                  </label>
                  <input
                    type={type}
                    name={name}
                    className="pure-u-23-24"
                    value={bookData[name]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    {...rest}
                  />
                </div>
              ))}

              <div className="pure-u-1 pure-u-md-1-3">
                <label htmlFor="status" className="form-label tooltips">
                  Status
                  <span className="tooltip-text">{tooltipsText[4].tooltip}</span>
                </label>
                <select
                  name="status"
                  className="pure-u-23-24"
                  value={bookData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="read">Read</option>
                  <option value="reading">Reading</option>
                  <option value="not read">Not Read</option>
                  <option value="to be read">To be read</option>
                  <option value="gave up">Gave up</option>
                  <option value="stuck">Stuck</option>
                </select>
              </div>

              <button type="submit" onClick={addBook} className="btn-table">
                Add Book to Library
              </button>
            </fieldset>
          </form>

          <div className='CSV_upload_container'>
            <h2>Upload Books via CSV</h2>
            <input type="file" accept=".csv" onChange={handleFileUpload} id='csvFileInput' />
            <button onClick={uploadCSVToFirestore} className='btn-table'>Upload CSV to Firestore</button>
          </div>
        </>
      ) : (
        <div className="AddedBooks_message">
          <h2>{message}</h2>
          <div className='btn_signOut_row'>
            <button onClick={resetForm} className='btn-table'>Add More</button>
            <button onClick={goHome} className='btn-table'>Home</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBook;
