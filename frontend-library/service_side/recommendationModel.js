const { HfInference } = require("@huggingface/inference");

// Initialize Hugging Face API with your API key
const hf = new HfInference("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");
const model = "sentence-transformers/paraphrase-MiniLM-L6-v2";

// Generate embeddings for a list of text items
async function generateEmbeddings(texts) {
    const embeddings = await Promise.all(
        texts.map(async (text) => {
            const response = await hf.featureExtraction({
                model,
                inputs: text,
            });
            return response;
        })
    );
    return embeddings;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] ** 2;
        normB += b[i] ** 2;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Main function to generate recommendations based on a given book name and user's library
async function generateRecommendations(bookName, books = [], userLibrary = []) {
  const userGenres = new Set(userLibrary.map(book => book.genre));
  const booksToExclude = new Set(userLibrary.map(book => book.title.toLowerCase()));

  // Remove strict genre filtering for testing
  const filteredBooks = books.filter(book =>
      book?.title && !booksToExclude.has(book.title.toLowerCase())
  );

  //console.log("Filtered books for recommendation:", filteredBooks);

  const inputs = [bookName, ...filteredBooks.map(book => `${book.title} ${book.description || ""}`)];
  const embeddings = await generateEmbeddings(inputs);

  const targetEmbedding = embeddings[0];
  const bookEmbeddings = embeddings.slice(1);

  const scores = bookEmbeddings.map((embedding, index) => {
      const similarity = cosineSimilarity(targetEmbedding, embedding) * 100;
      //console.log(`Similarity for ${filteredBooks[index].title}: ${similarity}%`);
      return { ...filteredBooks[index], similarity };
  });

  // Sort by similarity and return the top 10 recommendations
  const sortedScores = scores.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  //console.log("Sorted recommendations:", sortedScores);

  return sortedScores.map(book => ({
      title: book.title,
      authors: book.authors || ["Unknown Author"],
      genre: book.genre,
      averageRating: book.averageRating || "N/A",
      similarity: book.similarity.toFixed(2),
      publicationDate: book.publicationDate,
      isbn: book.isbn
  }));
}


module.exports = { generateRecommendations };