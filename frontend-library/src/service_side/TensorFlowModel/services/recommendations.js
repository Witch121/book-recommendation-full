const tf = require('@tensorflow/tfjs');

async function getRecommendations(bookName, books, model, userPreferences = {}, topN = 10) {
    const bookTitles = books.map(book => book.title.toLowerCase());
    const lowerBookName = bookName.toLowerCase();
  
    const bookIndex = bookTitles.indexOf(lowerBookName);
    if (bookIndex === -1) {
      return [`No close match found for '${bookName}'`];
    }

    // Ensure the keywords vector has the correct number of features (40 features here for each book)
    const keywordVectors = books.map(book => {
        // Assuming the keyword vectors were computed with 40 features during training
        const vector = new Array(40).fill(0); // Replace with the actual keyword vectorization logic
        // Ensure vector is the correct size (40)
        return vector;
    });
    const keywordTensors = tf.tensor2d(keywordVectors, [books.length, 40]);

    // Ensure ratings are present and numeric
    const ratingTensors = tf.tensor2d(books.map(book => [book.averageRating || 0]), [books.length, 1]);

    // Ensure genres are processed correctly
    const preferredGenre = userPreferences.genres || '';
    const genres = books.map(book => (book.genre === preferredGenre ? 1 : 0));   
    const genreTensors = tf.tensor2d(genres.map(genre => [genre]), [books.length, 1]);

    console.log('keywordTensors:', keywordTensors.shape);
    console.log('ratingTensors:', ratingTensors.shape);
    console.log('genreTensors:', genreTensors.shape);

    // Predict ratings for all books
    const predictions = await model.predict([keywordTensors, ratingTensors, genreTensors]).data();
  
    const recommendations = books
      .map((book, index) => ({ ...book, predictedRating: predictions[index] }))
      .sort((a, b) => b.predictedRating - a.predictedRating)
      .slice(0, topN);
  
    return recommendations.map(book => ({
      title: book.title,
      authors: book.authors,
      publishedDate: book.publishedDate,
      averageRating: book.averageRating,
      predictedRating: book.predictedRating.toFixed(2),
      ratingsCount: book.ratingsCount
    }));
}

module.exports = { getRecommendations };