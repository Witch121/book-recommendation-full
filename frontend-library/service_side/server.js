const express = require("express");
const cors = require("cors");
const { generateRecommendations }= require("./recommendationModel");
const { fetchGoogleBooksData } = require("./googleBooksAPI");

const app = express();
const port = 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.post('/api/', async (req, res) => {
  // console.log(typeof generateRecommendations);
  const { book_name, user_id } = req.body;
  if (!book_name || !user_id) {
      return res.status(400).json({ error: 'Missing book name or user ID' });
  }

  try {
      // Fetch book data from Google Books API
      const googleBooksResponse = await fetchGoogleBooksData(book_name);
      const books = googleBooksResponse.items.map(item => ({
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors,
          averageRating: item.volumeInfo.averageRating,
          ratingsCount: item.volumeInfo.ratingsCount,
      }));

      // Get recommendations using TensorFlow model
      const recommendations = await generateRecommendations(book_name, books, user_id);
      res.json(recommendations);
  } catch (error) {
      console.error('Error processing recommendation:', error);
      res.status(500).json({ error: 'Error processing recommendation' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});