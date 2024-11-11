import { HfInference } from "@huggingface/inference";
import { db } from "../src/components/firebaseFolder/firebase";
import { doc, getDoc } from "firebase/firestore";

const hf = new HfInference("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");
const model = "sentence-transformers/paraphrase-MiniLM-L6-v2";

interface Book {
    title: string;
    authors: string[];
    genre: string;
    averageRating?: number;
    ratingsCount?: number;
    description?: string;
    publicationDate?: string | null;
    isbn?: string | null;
}

interface UserPreferences {
    favoriteGenres: string[];
    favoriteAuthors: string[];
    favoriteBooks: string[];
}

interface UserLibraryBook {
    title: string;
    author: string;
}

// Generate embeddings for a list of text items
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(
        texts.map(async (text) => {
            const response = await hf.featureExtraction({
                model,
                inputs: text,
            });
            return response as number[];
        })
    );
    return embeddings;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
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

// Generate recommendations with enhancements
async function generateRecommendations(
    bookName: string,
    books: Book[],
    userLibrary: Book[] = [],
    userPreferences: UserPreferences
    ): Promise<Book[]> {
    const { favoriteGenres, favoriteAuthors, favoriteBooks } = userPreferences;

    const libraryTitles = new Set(userLibrary.map((book) => book.title.toLowerCase()));
    const filteredBooks = books.filter(book => {
        const isFavoriteGenre = favoriteGenres.includes(book.genre);
        const isFavoriteAuthor = book.authors.some(author => favoriteAuthors.includes(author));
        const isFavoriteBook = favoriteBooks.includes(book.title);
        const isInLibrary = libraryTitles.has(book.title.toLowerCase());
        return !isInLibrary && (isFavoriteGenre || isFavoriteAuthor || isFavoriteBook);
    });

    const booksToRecommend = filteredBooks.length > 0 ? filteredBooks : books;

    // Include additional features for more informative embeddings
    const inputs = [bookName, ...booksToRecommend.map(book => 
        `${book.title} ${book.description || ""} ${book.genre || ""} ${book.authors.join(", ") || ""}`
    )];
    
    const embeddings = await generateEmbeddings(inputs);
    const targetEmbedding = embeddings[0];
    const bookEmbeddings = embeddings.slice(1);

    // Adjust similarity score based on preferences, ratings, and popularity
    const scores = bookEmbeddings.map((embedding, index) => {
        const similarity = cosineSimilarity(targetEmbedding, embedding) * 100;
        let adjustedSimilarity = similarity;
        
        // Boost similarity if book matches user preferences
        if (favoriteGenres.includes(booksToRecommend[index].genre)) adjustedSimilarity += 5;
        if (favoriteAuthors.some(author => booksToRecommend[index].authors.includes(author))) adjustedSimilarity += 5;

        // Adjust similarity based on average rating and ratings count
        const book = booksToRecommend[index];
        if (book.averageRating) adjustedSimilarity *= (1 + book.averageRating / 10);
        if (book.ratingsCount && book.ratingsCount > 50) adjustedSimilarity += 5;

        return { ...book, similarity: adjustedSimilarity };
    });

    return scores.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
}

export { generateRecommendations };
export type { Book, UserPreferences, UserLibraryBook };