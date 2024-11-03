const axios = require("axios");
const wdk = require("wikidata-sdk");

const GOOGLE_BOOKS_API_KEY = "AIzaSyC5wi21T3Beglj2_lIaANzH-UAokChPczQ";

async function fetchGoogleBooksData(query, language = "en", maxResults = 10) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=${language}&maxResults=${maxResults}&key=${GOOGLE_BOOKS_API_KEY}`;

  try {
      const response = await axios.get(url);
      
      // Check if response.data.items exists and is an array
      if (Array.isArray(response.data.items)) {
          return response.data.items.map(item => ({
              title: item.volumeInfo.title,
              authors: item.volumeInfo.authors,
              description: item.volumeInfo.description,
              categories: item.volumeInfo.categories,
              pageCount: item.volumeInfo.pageCount,
              language: item.volumeInfo.language,
              averageRating: item.volumeInfo.averageRating,
              ratingsCount: item.volumeInfo.ratingsCount
          }));
      } else {
          console.error("No items found in Google Books response.");
          return [];
      }
  } catch (error) {
      console.error("Error fetching data from Google Books API:", error);
      return [];
  }
}
async function fetchWikidataBookData(title) {
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
      const data = wdk.simplify.sparqlResults(response.data);
      return data.map(item => ({
          title: item.bookLabel,
          author: item.authorLabel,
          genre: item.genreLabel,
          publicationDate: item.publicationDate,
          isbn: item.isbn
      }));
  } catch (error) {
      console.error("Error fetching data from Wikidata:", error);
      return [];
  }
}

// Combine all data sources into one function
const fetchBookData = async (query) => {
  try {
      const googleBooksData = await fetchGoogleBooksData(query);
      //console.log("Google Books data:", googleBooksData);

      const wikidataBooks = await fetchWikidataBookData(query);
      //console.log("Wiki data:", wikidataBooks);

      // Ensure googleBooksData, openLibraryData, and wikidataBooks are arrays
      const combinedData = googleBooksData.map(book => {
          const wikidataMatch = wikidataBooks.find(
              wikiBook => wikiBook.title.toLowerCase() === book.title.toLowerCase()
          );

          return {
              ...book,
              author: wikidataMatch?.author || book.authors?.[0],
              genre: wikidataMatch?.genre || book.categories?.[0],
              publicationDate: wikidataMatch?.publicationDate || null,
              isbn: wikidataMatch?.isbn || null
          };
      });

      return combinedData;
  } catch (error) {
      console.error("Error fetching combined book data:", error);
      throw error;
  }
};

module.exports = { fetchBookData };