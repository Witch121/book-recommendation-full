# Use official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory inside the container to /python_part
WORKDIR /python_part

# Copy the current directory contents into the container at /python_part
COPY . /python_part

# Install any dependencies specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 8080 to the outside world
EXPOSE 8080

# Run the Flask app (assuming it is called main.py)
CMD ["flask", "run", "--host=0.0.0.0", "--port=8080"]
