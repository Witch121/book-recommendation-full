import requests
import pandas as pd
from surprise import Dataset, Reader, KNNBasic
from surprise.model_selection import train_test_split
from surprise import accuracy
import difflib

# Function to fetch data from Google Books API
def fetch_google_books_data(query, api_key, max_results=40):
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults={max_results}&key={api_key}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# Fetch data
query = "machine learning"
api_key = "AIzaSyBDzM7u4da4oIwlp0TYOlJ1qWbCsrn30FM"
data = fetch_google_books_data(query, api_key)

# Extract relevant fields
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

# Load data into a DataFrame
df = pd.DataFrame(books)

# Simulate user ratings (since we don't have actual ratings from Google Books API)
# For demonstration purposes, assume each book gets a random rating between 1 and 5 by different users
import random

df['user_id'] = [random.randint(1, 10) for _ in range(len(df))]
df['book_id'] = range(1, len(df) + 1)
df['rating'] = [random.randint(1, 5) for _ in range(len(df))]

# Ensure the dataset has the required columns for collaborative filtering
if 'user_id' not in df.columns or 'book_id' not in df.columns or 'rating' not in df.columns:
    raise ValueError("Dataset must contain 'user_id', 'book_id', and 'rating' columns.")

# Prepare the data for the Surprise library
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(df[['user_id', 'book_id', 'rating']], reader)

# Split data into training and test sets
trainset, testset = train_test_split(data, test_size=0.25)

# Use the KNNBasic algorithm for item-based collaborative filtering
algo = KNNBasic(sim_options={'user_based': False})
algo.fit(trainset)

# Predict ratings for the test set
predictions = algo.test(testset)
accuracy.rmse(predictions)

# Define a function to get book recommendations
def get_book_recommendations(book_name, df, algo, top_n=10):
    # Find the closest match for the book name
    list_of_all_titles = df['title'].tolist()
    find_close_match = difflib.get_close_matches(book_name, list_of_all_titles)
    
    if not find_close_match:
        print(f"No close match found for '{book_name}'")
        return
    
    close_match = find_close_match[0]
    book_id = df[df['title'] == close_match]['book_id'].values[0]
    book_inner_id = algo.trainset.to_inner_iid(book_id)
    
    # Find similar books
    book_neighbors = algo.get_neighbors(book_inner_id, k=top_n)
    
    # Convert inner ids to book ids and get titles
    book_neighbors_ids = [algo.trainset.to_raw_iid(inner_id) for inner_id in book_neighbors]
    book_titles = df[df['book_id'].isin(book_neighbors_ids)]['title'].tolist()
    
    print('Books suggested for you:\n')
    for i, title in enumerate(book_titles):
        print(f"{i + 1}. {title}")

# Get user input and provide recommendations
book_name = input('Enter your favorite book name: ')
get_book_recommendations(book_name, df, algo)
