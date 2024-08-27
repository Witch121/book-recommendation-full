import requests
import pandas as pd
from surprise import Dataset, Reader, KNNBasic
from surprise.model_selection import train_test_split
from surprise import accuracy
import difflib

# Function to fetch data from Open Library API
def fetch_open_library_data(query):
    url = f"https://openlibrary.org/search.json?q={query}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# Fetch data
query = "machine learning"
data = fetch_open_library_data(query)

# Extract relevant fields
books = []
for doc in data['docs']:
    book = {
        'title': doc.get('title', 'N/A'),
        'author': ', '.join(doc.get('author_name', [])) if 'author_name' in doc else 'N/A',
        'first_publish_year': doc.get('first_publish_year', 'N/A'),
        'isbn': ', '.join(doc.get('isbn', [])) if 'isbn' in doc else 'N/A',
    }
    books.append(book)

# Load data into a DataFrame
df = pd.DataFrame(books)

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
