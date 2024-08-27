from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pandas as pd
from surprise import Dataset, Reader, KNNBasic
from surprise.model_selection import train_test_split
import difflib
import random

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Function to fetch data from Google Books API
def fetch_google_books_data(query, api_key, max_results=40):
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults={max_results}&key={api_key}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# Function to prepare data and train the model
def prepare_model(book_name, api_key):
    query = book_name
    data = fetch_google_books_data(query, api_key)

    books = []
    for item in data.get('items', []):
        volume_info = item.get('volumeInfo', {})
        book = {
            'title': volume_info.get('title', 'N/A'),
            'authors': ', '.join(volume_info.get('authors', [])) if 'authors' in volume_info else 'N/A',
            'publishedDate': volume_info.get('publishedDate', 'N/A'),
            'description': volume_info.get('description', 'N/A'),
            'isbn': ', '.join([identifier['identifier'] for identifier in volume_info.get('industryIdentifiers', []) if 'identifier' in identifier]),
        }
        books.append(book)

    df = pd.DataFrame(books)
        
    # Print all the titles fetched
    print("Fetched Titles: ", df['title'].tolist())
    
    # Simulate user ratings for demonstration
    df['user_id'] = [random.randint(1, 10) for _ in range(len(df))]
    df['book_id'] = range(1, len(df) + 1)
    df['rating'] = [random.randint(1, 5) for _ in range(len(df))]

    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df[['user_id', 'book_id', 'rating']], reader)
    trainset, testset = train_test_split(data, test_size=0.25)
    
    algo = KNNBasic(sim_options={'user_based': False})
    algo.fit(trainset)
    
    return df, algo

# API route to get book recommendations
@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    book_name = data.get('book_name')
    api_key = "AIzaSyBDzM7u4da4oIwlp0TYOlJ1qWbCsrn30FM"
    df, algo = prepare_model(book_name, api_key)
    recommendations = get_book_recommendations(book_name, df, algo)
    return jsonify(recommendations)

# Function to get book recommendations
def get_book_recommendations(book_name, df, algo, top_n=10):
    list_of_all_titles = df['title'].tolist()
    
    # Convert to lowercase to make matching case-insensitive
    list_of_all_titles_lower = [title.lower() for title in list_of_all_titles]
    book_name_lower = book_name.lower()
    
    find_close_match = difflib.get_close_matches(book_name_lower, list_of_all_titles_lower)
    
    if not find_close_match:
        return ["No close match found for '{}'".format(book_name)]
    
    close_match = find_close_match[0]
    # Retrieve the original title from the DataFrame using the index
    original_match = list_of_all_titles[list_of_all_titles_lower.index(close_match)]
    
    book_id = df[df['title'] == original_match]['book_id'].values[0]
    book_inner_id = algo.trainset.to_inner_iid(book_id)
    
    book_neighbors = algo.get_neighbors(book_inner_id, k=top_n)
    book_neighbors_ids = [algo.trainset.to_raw_iid(inner_id) for inner_id in book_neighbors]
    book_titles = df[df['book_id'].isin(book_neighbors_ids)]['title'].tolist()
    
    return book_titles

if __name__ == '__main__':
    app.run(debug=True)
