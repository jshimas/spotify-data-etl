# Spotify Data Transformation and Storage Project

## Description

This project involves ingesting, transforming, and analyzing Spotify sample datasets. The implementation includes a Node.js script for data ingestion and transformation, as well as SQL scripts for data storage and processing. The cleaned and transformed data is stored in AWS S3, and then from AWS S3 loaded into a locally hosted PostgreSQL database.

## Running the Project

**Prerequisites**:

1. [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running on your local machine.
2. Node.js and npm installed

**Steps:**

1. **Download and Prepare Datasets:**

   - Download the Spotify sample datasets from Kaggle:
     - [Artists Dataset](https://www.kaggle.com/datasets/yamaerenay/spotify-dataset-19212020-600k-tracks?select=artists.csv)
     - [Tracks Dataset](https://www.kaggle.com/datasets/yamaerenay/spotify-dataset-19212020-600k-tracks?select=tracks.csv)
   - Unzip the downloaded files into the `./datasets` folder of this project.

2. **Set Up AWS S3 Bucket Variables:**

   Declare AWS S3 Bucket variables inside a .env file or override them in the ./src/index.ts file

3. **Run the Docker Compose for for PostgreSQL DB:**

   ```bash
   docker compose up -d
   ```

4. **Run the Node.js Script:**

   ```bash
   npx ts-node ./src/index.ts
   ```

5. **Connect to the Database:**

   Connect to the PostgreSQL database using the connection parameters specified in the ./docker-compose.yaml file.

### Additional Notes

- The Node.js script (index.ts) initiates the data transformation and storage process.
- The Docker Compose configuration sets up a PostgreSQL container for local database storage.
- Monitor the script's console logs for progress and potential errors.
