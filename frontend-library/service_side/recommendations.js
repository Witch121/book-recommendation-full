const tf = require("@tensorflow/tfjs");

async function getRecommendations(bookName, books, model, topN = 10) {
    const bookTitles = books.map(book => book.title.toLowerCase());
    const lowerBookName = bookName.toLowerCase();

    // Find if the requested book exists in the list
    const bookIndex = bookTitles.indexOf(lowerBookName);
    if (bookIndex === -1) {
        return [`No close match found for '${bookName}'`];
    }

    // Create feature tensor with the correct shape (40 features)
    const keywordVectors = books.map(() => new Array(40).fill(0));  // 40 features
    const keywordTensors = tf.tensor2d(keywordVectors, [books.length, 40]);

    // Pass only the keywordTensors to the model (with 40 features)
    const predictions = await model.predict(keywordTensors).dataSync();

    // Sort the books based on the predicted rating
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
