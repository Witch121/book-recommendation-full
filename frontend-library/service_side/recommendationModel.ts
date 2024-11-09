import { HfInference } from "@huggingface/inference";

const hf = new HfInference("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");
const model = "sentence-transformers/paraphrase-MiniLM-L6-v2";

interface Book {
    title: string;
    authors: string[];
    genre: string;
    averageRating?: number;
    description?: string;
    publicationDate?: string | null;
    isbn?: string | null;
}

interface UserPreferences {
    favoriteGenres: string[];
    favoriteAuthors: string[];
    favoriteBooks: string[];
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

// Generate recommendations based on a book name, user's library, and preferences
async function generateRecommendations(
    bookName: string,
    books: Book[],
    userLibrary: Book[] = [],
    userPreferences: UserPreferences = { favoriteGenres: [], favoriteAuthors: [], favoriteBooks: [] }
): Promise<Book[]> {
    const { favoriteGenres, favoriteAuthors, favoriteBooks } = userPreferences;

    // Filter books based on user preferences
    const filteredBooks = books.filter(book => {
        const isFavoriteGenre = favoriteGenres.includes(book.genre);
        const isFavoriteAuthor = book.authors.some(author => favoriteAuthors.includes(author));
        const isFavoriteBook = favoriteBooks.includes(book.title);
        return isFavoriteGenre || isFavoriteAuthor || isFavoriteBook;
    });

    const booksToRecommend = filteredBooks.length > 0 ? filteredBooks : books;
    const inputs = [bookName, ...booksToRecommend.map(book => `${book.title} ${book.description || ""}`)];
    const embeddings = await generateEmbeddings(inputs);

    const targetEmbedding = embeddings[0];
    const bookEmbeddings = embeddings.slice(1);

    const scores = bookEmbeddings.map((embedding, index) => {
        const similarity = cosineSimilarity(targetEmbedding, embedding) * 100;
        return { ...booksToRecommend[index], similarity };
    });

    return scores.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
}

export { generateRecommendations };
export type { Book, UserPreferences };
