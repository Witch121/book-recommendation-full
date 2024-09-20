from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pandas as pd
from surprise import Dataset, Reader, KNNBasic
from surprise.model_selection import train_test_split
import difflib

app = Flask(__name__)
CORS(app)

# Constants
API_KEY = "AIzaSyBDzM7u4da4oIwlp0TYOlJ1qWbCsrn30FM"
DEFAULT_RATING = 3.0
LANGUAGE = 'en'
MAX_RESULTS = 40

# Function to fetch data from Google Books API, including language relevance and rating
def fetch_google_books_data(query: str, api_key: str = API_KEY, language: str = LANGUAGE, max_results: int = MAX_RESULTS) -> dict:
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}&langRestrict={language}&maxResults={max_results}&key={api_key}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# Helper function to extract book information
def extract_book_info(item: dict) -> dict:
    volume_info = item.get('volumeInfo', {})
    return {
        'title': volume_info.get('title', 'N/A'),
        'authors': ', '.join(volume_info.get('authors', [])) if 'authors' in volume_info else 'N/A',
        'publishedDate': volume_info.get('publishedDate', 'N/A'),
        'description': volume_info.get('description', 'N/A'),
        'isbn': ', '.join([identifier['identifier'] for identifier in volume_info.get('industryIdentifiers', []) if 'identifier' in identifier]),
        'averageRating': volume_info.get('averageRating', DEFAULT_RATING),  # Default rating used
        'ratingsCount': volume_info.get('ratingsCount', 0)
    }

# Function to prepare data and train the recommendation model
def prepare_model(book_name: str, api_key: str = API_KEY, language: str = LANGUAGE) -> tuple[pd.DataFrame, KNNBasic]:
    data = fetch_google_books_data(book_name, api_key, language)
    books = [extract_book_info(item) for item in data.get('items', [])]

    df = pd.DataFrame(books)
    df['book_id'] = range(1, len(df) + 1)
    df['user_id'] = [1] * len(df)
    df['rating'] = df['averageRating'].fillna(DEFAULT_RATING)

    reader = Reader(rating_scale=(1, 5))
    surprise_data = Dataset.load_from_df(df[['user_id', 'book_id', 'rating']], reader)
    trainset, _ = train_test_split(surprise_data, test_size=0.25)

    algo = KNNBasic(sim_options={'user_based': False})
    algo.fit(trainset)

    return df, algo

# Function to get book recommendations
def get_book_recommendations(book_name: str, df: pd.DataFrame, algo: KNNBasic, top_n: int = 10) -> list:
    titles = df['title'].str.lower().tolist()
    book_name_lower = book_name.lower()

    close_match = difflib.get_close_matches(book_name_lower, titles, n=1)
    if not close_match:
        return [{"message": f"No close match found for '{book_name}'"}]

    match_index = titles.index(close_match[0])
    book_id = df.iloc[match_index]['book_id']
    book_inner_id = algo.trainset.to_inner_iid(book_id)
    book_neighbors = algo.get_neighbors(book_inner_id, k=top_n)

    neighbors_ids = [algo.trainset.to_raw_iid(inner_id) for inner_id in book_neighbors]
    recommendations = df[df['book_id'].isin(neighbors_ids)][['title', 'authors', 'publishedDate', 'averageRating', 'ratingsCount']].to_dict(orient='records')

    return recommendations

# API route to get book recommendations
@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    book_name = data.get('book_name')
    
    if not book_name:
        return jsonify({"error": "book_name is required"}), 400

    df, algo = prepare_model(book_name)
    recommendations = get_book_recommendations(book_name, df, algo)
    
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)
