#  📖 LibroShelf Backend API

<div align="center">
  
  **API REST for the LibroShelf web**
  
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-8.15.1-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
</div>

## 📚 Project Overview

LibroShelf Backend API is a RESTful service designed to power the LibroShelf web application. It provides endpoints for managing books, users, authentication, and other core features. Built with Node.js, TypeScript, Express, and MongoDB, the API ensures scalability, security, and maintainability.

For the books database , i used GoogleBooksAPI. 

## 🗂️ Architecture Diagram

![LibroShelf Backend Architecture](public/diagrama.png)

## 🚀 Features

- User authentication and authorization (JWT)
- CRUD operations for books and users
- Search and filter books
- Secure password hashing
- Error handling and validation
- Environment-based configuration
- Books info , with the thumbnail

Funtions: 
- Follow sistem
- Save your books
- rate your own books and add comments

## 🛠️ Installation

1. **Clone the repository:**
  ```bash
  git clone https://github.com/your-username/LibroShelf_Backend.git
  cd LibroShelf_Backend
  ```

2. **Install dependencies:**
  ```bash
  npm install
  ```

3. **Configure environment variables:**
  - Copy `.env.example` to `.env` and update the values.

4. **Run the development server:**
  ```bash
  npm run dev
  ```
  ## 📑 API Documentation

  ## User Endpoints

  **Base URL:** `http://localhost:4000/api/users`

  ---

  #### 1. Get Authenticated User

  - **Endpoint:** `/user`
  - **Method:** `GET`
  - **Auth:** Bearer Token required
  - **Description:** Returns the authenticated user’s profile data.

  ---

  #### 2. Authenticate User (Login)

  - **Endpoint:** `/auth/login`
  - **Method:** `POST`
  - **Auth:** None
  - **Description:** Authenticates a user and returns a token.
  - **Body (JSON):**
    ```json
    {
      "email": "victor@gmail.com",
      "password": "12345678"
    }
    ```

  ---

  #### 3. Register New User

  - **Endpoint:** `/auth/register`
  - **Method:** `POST`
  - **Auth:** None
  - **Description:** Creates a new user account.
  - **Body (JSON):**
    ```json
    {
      "handle": "Paula",
      "name": "paula",
      "email": "paula@gmail.com",
      "password": "12345678"
    }
    ```

  ---

  #### 4. Follow a User

  - **Endpoint:** `/follow`
  - **Method:** `POST`
  - **Auth:** Bearer Token required
  - **Description:** Follows another user by their handle.
  - **Body (JSON):**
    ```json
    {
      "handle": "victor"
    }
    ```

  ---

  #### 5. Unfollow a User

  - **Endpoint:** `/unfollow`
  - **Method:** `POST`
  - **Auth:** Bearer Token required
  - **Description:** Unfollows a user by their handle.
  - **Body (JSON):**
    ```json
    {
      "handle": "paula"
    }
    ```

  ---

  #### 6. Get User Feed

  - **Endpoint:** `/feed`
  - **Method:** `GET`
  - **Auth:** Bearer Token required
  - **Description:** Returns the feed of posts from followed users.


  ## 📚 Books Endpoints

  ### 1. Add a Book

  - **Endpoint:** `/add`
  - **Method:** `POST`
  - **Auth:** Bearer Token required
  - **Description:** Adds a book to the authenticated user’s collection.
  - **Body (JSON):**
    ```json
    {
      "bookId": "8FjODwAAQBAJ"
    }
    ```

  ---

  ### 2. Search Book by Title

  - **Endpoint:** `/search`
  - **Method:** `GET`
  - **Auth:** None
  - **Description:** Searches for books by title.
  - **Body (JSON):**
    ```json
    {
      "title": "harry potter"
    }
    ```

  ---

  ### 3. Delete a Book

  - **Endpoint:** `/delete`
  - **Method:** `DELETE`
  - **Auth:** Bearer Token required
  - **Description:** Deletes a book from the authenticated user’s collection.
  - **Body (JSON):**
    ```json
    {
      "bookId": "89tu0AEACAAJ"
    }
    ```

  ---

  ### 4. List All Books of a User

  - **Endpoint:** `/list`
  - **Method:** `POST`
  - **Auth:** None
  - **Description:** Lists all books belonging to a specific user by handle.
  - **Body (JSON):**
    ```json
    {
      "handle": "paula"
    }
    ```

  ---

  ### 5. Get All My Books

  - **Endpoint:** `/mybooks`
  - **Method:** `GET`
  - **Auth:** Bearer Token required
  - **Description:** Returns all books in the authenticated user’s collection.

  ---

  ### 6. Add or Update Rating

  - **Endpoint:** `/update`
  - **Method:** `PUT`
  - **Auth:** Bearer Token required
  - **Description:** Adds or updates a rating and review for a book.
  - **Body (JSON):**
    ```json
    {
      "id": "8FjODwAAQBAS",
      "rating": 3,
      "description": "me gusto muchoo"
    }
    ```

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements.
