const tf = require('@tensorflow/tfjs');
const natural = require('natural');
// const { plot } = require('nodeplotlib');

async function getRecommendations(bookName, books, model, userPreferences = {}, topN = 10) {
    const bookTitles = books.map(book => book.title.toLowerCase());
    const lowerBookName = bookName.toLowerCase();
  
    const bookIndex = bookTitles.indexOf(lowerBookName);
    if (bookIndex === -1) {
      return [`No close match found for '${bookName}'`];
    }

    // TF-IDF keyword vectorization
    const tfidf = new natural.TfIdf();
    books.forEach(book => tfidf.addDocument(book.keywords.join(' ')));

    const maxFeatures = 40; // Ensure the number of features matches what was used during training

    const keywordVectors = books.map(book => {
        const vector = new Array(maxFeatures).fill(0);
        tfidf.tfidfs(book.keywords.join(' '), (i, measure) => {
            if (i < maxFeatures) {
                vector[i] = measure;
            }
        });
        return vector;
    });

    const keywordTensors = tf.tensor2d(keywordVectors, [books.length, maxFeatures]);

    // Ensure ratings are present and numeric
    const ratingTensors = tf.tensor2d(books.map(book => [book.averageRating || 0]), [books.length, 1]);

    // Ensure genres are processed correctly
    const preferredGenre = userPreferences.genres || '';
    const genres = books.map(book => (book.genre === preferredGenre ? 1 : 0));   
    const genreTensors = tf.tensor2d(genres.map(genre => [genre]), [books.length, 1]);

    // console.log('keywordTensors:', keywordTensors.shape);
    // console.log('ratingTensors:', ratingTensors.shape);
    // console.log('genreTensors:', genreTensors.shape);

    // Predict ratings for all books
    const predictions = await model.predict([keywordTensors, ratingTensors, genreTensors]).data();
  
    const recommendations = books
      .map((book, index) => ({ ...book, predictedRating: predictions[index] }))
      .sort((a, b) => b.predictedRating - a.predictedRating)
      .slice(0, topN);

  //   // Log predictions and actual ratings for comparison
  //   recommendations.forEach((book, index) => {
  //     console.log(`Title: ${book.title}`);
  //     console.log(`Actual Rating: ${book.averageRating}`);
  //     console.log(`Predicted Rating: ${book.predictedRating.toFixed(2)}`);
  //     console.log('-------------------------------------');

  //   // Extract data for visualization
  //   const actualRatings = recommendations.map(book => book.averageRating);
  //   const predictedRatings = recommendations.map(book => parseFloat(book.predictedRating.toFixed(2)));
  //   const titles = recommendations.map(book => book.title);
  //   // Plot the comparison of actual vs predicted ratings
  //   plot([
  //     {
  //         x: titles,
  //         y: actualRatings,
  //         type: 'bar',
  //         name: 'Actual Ratings',
  //         marker: { color: 'blue' }
  //     },
  //     {
  //         x: titles,
  //         y: predictedRatings,
  //         type: 'bar',
  //         name: 'Predicted Ratings',
  //         marker: { color: 'green' }
  //     }
  // ], {
  //     title: 'Actual vs Predicted Ratings for Top Recommendations',
  //     xaxis: { title: 'Books' },
  //     yaxis: { title: 'Ratings' },
  //     barmode: 'group'
  // });
  // });
  
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
