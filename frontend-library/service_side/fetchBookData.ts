import axios from "axios";
import { Book } from "./recommendationModel";
const wdk = require("wikidata-sdk");

interface GoogleBook {
    title: string;
    authors: string[];
    description?: string;
    categories?: string[];
    pageCount?: number;
    language?: string;
    averageRating?: number;
    ratingsCount?: number;
}

interface WikidataBook {
    title: string;
    author?: string;
    genre?: string;
    publicationDate?: string;
    isbn?: string;
    bookLabel?: string;
    authorLabel?: string;
    genreLabel?: string; 
}

const GOOGLE_BOOKS_API_KEY = "AIzaSyC5wi21T3Beglj2_lIaANzH-UAokChPczQ";
async function fetchGoogleBooksData(query: string, language = "en", maxResults = 10): Promise<GoogleBook[]> {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=${language}&maxResults=${maxResults}&key=${GOOGLE_BOOKS_API_KEY}`;

    try {
        const response = await axios.get(url);
        if (Array.isArray(response.data.items)) {
            return response.data.items.map((item: any) => ({
                title: item.volumeInfo.title,
                authors: item.volumeInfo.authors || ["Unknown Author"],
                description: item.volumeInfo.description || "",
                categories: item.volumeInfo.categories || ["General"],
                pageCount: item.volumeInfo.pageCount || 0,
                language: item.volumeInfo.language || "unknown",
                averageRating: item.volumeInfo.averageRating || 0,
                ratingsCount: item.volumeInfo.ratingsCount || 0
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching data from Google Books API:", error);
        return [];
    }
}

// Fetch data from Wikidata
async function fetchWikidataBookData(title: string): Promise<WikidataBook[]> {
    const sparql = `
        SELECT ?book ?bookLabel ?author ?authorLabel ?genreLabel ?publicationDate ?isbn WHERE {
            ?book wdt:P31 wd:Q571;
                  rdfs:label "${title}"@en;
                  wdt:P50 ?author;
                  wdt:P136 ?genre;
                  wdt:P577 ?publicationDate.
            OPTIONAL { ?book wdt:P212 ?isbn }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        } LIMIT 10
    `;
    const url = wdk.sparqlQuery(sparql);

    try {
        const response = await axios.get(url);
        const data = wdk.simplify.sparqlResults(response.data) as WikidataBook[];

        return data.map(item => ({
            title: item.bookLabel || "Unknown Title",
            author: item.authorLabel || "Unknown Author",
            genre: item.genreLabel || "General",
            publicationDate: item.publicationDate || undefined,
            isbn: item.isbn || undefined
        }));
    } catch (error) {
        console.error("Error fetching data from Wikidata:", error);
        return [];
    }
}


// Combine data from Google Books and Wikidata
async function fetchBookData(query: string): Promise<Book[]> {
    try {
        const googleBooksData = await fetchGoogleBooksData(query);
        const wikidataBooks = await fetchWikidataBookData(query);

        const combinedData: Book[] = googleBooksData.map(book => {
            const wikidataMatch = wikidataBooks.find(
                wikiBook => wikiBook.title.toLowerCase() === book.title.toLowerCase()
            );

            return {
                title: book.title,
                authors: book.authors || ["Unknown Author"],
                description: book.description || "",
                categories: book.categories || ["General"],
                pageCount: book.pageCount || 0,
                language: book.language || "unknown",
                averageRating: book.averageRating || 0,
                ratingsCount: book.ratingsCount || 0,
                genre: wikidataMatch?.genre || book.categories?.[0] || "General",
                author: wikidataMatch?.author || book.authors[0] || "Unknown Author",
                publicationDate: wikidataMatch?.publicationDate || null,
                isbn: wikidataMatch?.isbn || null
            };
        });

        return combinedData;
    } catch (error) {
        console.error("Error fetching combined book data:", error);
        throw error;
    }
}

export { fetchBookData };
export type { GoogleBook, WikidataBook };