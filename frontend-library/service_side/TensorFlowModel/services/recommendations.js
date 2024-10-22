const tf = require('@tensorflow/tfjs');

async function getRecommendations(bookName, books, model, topN = 10) {
    const bookTitles = books.map(book => book.title.toLowerCase());
    const lowerBookName = bookName.toLowerCase();
  
    const bookIndex = bookTitles.indexOf(lowerBookName);
    if (bookIndex === -1) {
      return [`No close match found for '${bookName}'`];
    }

    const keywordVectors = books.map(() => new Array(40).fill(0));
    const keywordTensors = tf.tensor2d(keywordVectors, [books.length, 40]);
    const ratingTensors = tf.tensor2d(books.map(book => [book.averageRating || 0]), [books.length, 1]);
    const genreTensors = tf.tensor2d(books.map(() => [1]), [books.length, 1]);

    const predictions = await model.predict([keywordTensors, ratingTensors, genreTensors]).data();
  
    const recommendations = books
      .map((book, index) => ({ ...book, predictedRating: predictions[index] }))
      .sort((a, b) => b.predictedRating - a.predictedRating)
      .slice(0, topN);
  
    return recommendations.map(book => ({
      title: book.title,
      authors: book.authors,
      averageRating: book.averageRating,
      predictedRating: book.predictedRating.toFixed(2),
      ratingsCount: book.ratingsCount
    }));
}

module.exports = { getRecommendations };