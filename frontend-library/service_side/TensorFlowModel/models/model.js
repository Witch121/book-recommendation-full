const tf = require('@tensorflow/tfjs');
const { fetchGoogleBooksData } = require('../services/googleBooksAPI');
const natural = require('natural'); // For text processing

async function prepareModel(bookName, language = 'en') {
  console.log(`Fetching Google Books data for: ${bookName}`);
  
  const data = await fetchGoogleBooksData(bookName, language);

  if (!data || !data.items || data.items.length === 0) {
    throw new Error('No books found for the given query.');
  }

  const books = data.items.map(item => {
    const volumeInfo = item.volumeInfo || {};
    return {
      title: volumeInfo.title || 'N/A',
      authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'N/A',
      keywords: volumeInfo.keywords || [],
      genre: volumeInfo.categories ? volumeInfo.categories[0] : 'N/A',
      averageRating: volumeInfo.averageRating || 3.0,
      ratingsCount: volumeInfo.ratingsCount || 0
    };
  });

  console.log(`Fetched ${books.length} books from Google Books API.`);

  // Prepare the list of keywords
  const keywordsList = books.map(book => book.keywords.length > 0 ? book.keywords.join(' ') : 'unknown');

  // Initialize TF-IDF vectorizer and generate vectors
  const tfidf = new natural.TfIdf();
  keywordsList.forEach(keywords => tfidf.addDocument(keywords));

  const keywordVectors = keywordsList.map(keywords => {
    const vector = [];
    tfidf.tfidfs(keywords, (i, measure) => vector.push(measure));
    return vector;
  });

  const numFeatures = keywordVectors[0].length;
  const numExamples = keywordVectors.length;

  // Create TensorFlow tensor from keyword vectors
  const keywordTensor = tf.tensor2d(keywordVectors, [numExamples, numFeatures]);

  // Prepare ratings tensor
  const ratings = books.map(book => book.averageRating);
  const ratingTensor = tf.tensor2d(ratings.map(rating => [rating]), [numExamples, 1]);

  // Prepare genres tensor based on the genre data from Google Books
  const genres = books.map(book => (book.genre === 'fiction' ? 1 : 0));  // Example genre

  const genreTensor = tf.tensor2d(genres.map(genre => [genre]), [numExamples, 1]);

  // Define the model architecture
  const inputKeywords = tf.input({ shape: [numFeatures], name: 'keywords' });
  const inputRating = tf.input({ shape: [1], name: 'rating' });
  const inputGenre = tf.input({ shape: [1], name: 'genre' });

  // Concatenate all inputs and build the model
  const concatenated = tf.layers.concatenate().apply([inputKeywords, inputRating, inputGenre]);
  const dense1 = tf.layers.dense({ units: 128, activation: 'relu' }).apply(concatenated);
  const output = tf.layers.dense({ units: 1 }).apply(dense1);

  const model = tf.model({ inputs: [inputKeywords, inputRating, inputGenre], outputs: output });

  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  console.log('Model compiled. Starting training...');

  // Train the model
  await model.fit(
    { keywords: keywordTensor, rating: ratingTensor, genre: genreTensor },
    ratingTensor,
    { epochs: 50 }
  );

  console.log('Model trained successfully.');

  return { books, model };
}

module.exports = { prepareModel };
