# Class Files Microservice

This is a simple stateless microservice built using Node.js and PostgreSQL to provide REST API endpoints for a Class Files app.

## Prerequisites

- Node.js v14 or later
- PostgreSQL v12 or later

## Local Setup

1. Install the required dependencies:

    ```npm install```


2. Create a `.env` file in the root directory of the project to configure the environment variables:

    ```touch .env```

Add the following environment variables to the `.env` file:

```
DB_USER=<your_database_username>
DB_PASSWORD=<your_database_password>
DB_HOST=<your_database_host>
DB_PORT=<your_database_port>
DB_NAME=<your_database_name>
JWT_SECRET=<your_jwt_secret>
```

Replace `<your_database_username>`, `<your_database_password>`, `<your_database_host>`, `<your_database_port>`, `<your_database_name>`, and `<your_jwt_secret>` with your actual database credentials and a secret for JWT signing.

3. Create the PostgreSQL database and tables:

- Connect to your PostgreSQL instance using your preferred client or `psql`.

- Create a new database with the name specified in the `DB_NAME` environment variable.

- Run the SQL commands in the `schema.sql` file to create the required tables.

4. Start the development server:

    ```npm run dev```


The server should now be running at `http://localhost:3000`.

## Running with Docker

1. Install Docker and Docker Compose on your local machine.

2. Build and run the Docker containers:

    ```docker-compose up -d --build```

The server should now be running at `http://localhost:3000`.

3. Stop and remove the Docker containers when you're done:

docker-compose down

## Testing

You can use a REST client like Postman or cURL to test the available API endpoints.

Check the `postman_collection.json` file for a collection of API requests that you can import into Postman.