const axios = require("axios");

const GOOGLE_BOOKS_API_KEY = "AIzaSyBDzM7u4da4oIwlp0TYOlJ1qWbCsrn30FM";

async function fetchGoogleBooksData(query, language = "en", maxResults = 40) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=${language}&maxResults=${maxResults}&key=${GOOGLE_BOOKS_API_KEY}`;
  
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching data from Google Books API:", error);
      throw error;
    }
  }
  
  module.exports = { fetchGoogleBooksData };
