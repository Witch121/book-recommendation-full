const express = require('express');
const { prepareModel } = require('../models/model');
const { getRecommendations } = require('../services/recommendations');

const router = express.Router();

router.post('/', async (req, res) => {
  const { book_name, user_preferences } = req.body;

  try {
    const { books, model } = await prepareModel(book_name, user_preferences);
    const recommendations = await getRecommendations(book_name, books, model, user_preferences);
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).send('Error generating recommendations');
  }
});

module.exports = router;