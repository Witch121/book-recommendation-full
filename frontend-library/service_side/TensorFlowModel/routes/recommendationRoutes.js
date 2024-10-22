const express = require('express');
const { prepareModel } = require('../models/model');
const { getRecommendations } = require('../services/recommendations');
const { fetchGoogleBooksData } = require('../services/googleBooksAPI');

const router = express.Router();

router.post('/', async (req, res) => {
  const { book_name } = req.body;

  try {
    console.log(`Starting recommendation process for book: ${book_name}`);

    // Train a new model based on the book name
    const { model, books } = await prepareModel(book_name);
    console.log('New model trained.');

    // Generate recommendations
    const recommendations = await getRecommendations(book_name, books, model);
    console.log('Recommendations generated:', recommendations);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).send('Error generating recommendations');
  }
});

router.get('/google-books', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    // Fetch data from Google Books API
    const googleBooksData = await fetchGoogleBooksData(query);
    res.json(googleBooksData);
  } catch (error) {
    console.error('Error fetching data from Google Books API:', error);
    res.status(500).json({ error: 'Failed to fetch data from Google Books API' });
  }
});

module.exports = router;