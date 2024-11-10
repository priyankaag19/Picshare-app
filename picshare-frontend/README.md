# PicShare Web App

## Overview
PicShare is a simple photo-sharing web app that allows users to share pictures by URL, mark their favorite pictures, and view details. The app is divided into a backend API (Node.js with MySQL) and a frontend (React.js with Typescript). Below are the steps to set up both components.
---

## Backend Setup

### Prerequisites
1. Install [Node.js](https://nodejs.org/en/) (preferably version 14.x or higher).
2. Install [MySQL](https://dev.mysql.com/downloads/installer/) (MySQL Workbench or command-line version).

### Backend Installation

1. Navigate to the backend project folder.

   cd picshare-backend

2. Install dependencies:

npm install
3. Create the MySQL database and tables using the SQL commands below.

Update database connection details in server.js:

4. const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Your MySQL username
    password: 'priyanka', // Your MySQL password
    database: 'picshare'  // Database name
});

## MySQL Database Setup
Run the following SQL commands to create the required tables:
Login to MySQL Dataase-- 
mysql -u root -p
Enter password: ******** //Enter your MySQL password

-- Create the 'picshare' database
CREATE DATABASE IF NOT EXISTS picshare;

USE picshare;

-- Create 'users' table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE
);

-- Create 'pictures' table
CREATE TABLE IF NOT EXISTS pictures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create 'favorites' table
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    picture_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (picture_id) REFERENCES pictures(id),
    UNIQUE(user_id, picture_id)
);

5. Running the Backend
Start the server: node index.js

The backend will run on http://localhost:5000.

## Frontend Setup
Prerequisites
1. Install Node.js (preferably version 14.x or higher).
Frontend Installation
2. Navigate to the frontend project folder.

cd picshare-frontend

3. Install dependencies:

npm install

4. Run the frontend:

npm start

The frontend will run on http://localhost:3000.

## Frontend and Backend Interaction
The frontend communicates with the backend via the following API endpoints:

Login / Register:
POST /api/login: Accepts a username in the body and returns the userId.
Pictures:
GET /api/pictures/all: Fetches all pictures from all users.
GET /api/pictures: Fetches pictures uploaded by a specific user.
POST /api/pictures: Allows users to share a new picture (URL + Title).
Favorites:
GET /api/favorites/:userId: Fetches the list of pictures marked as favorite by a specific user.
POST /api/favorites: Allows users to add a picture to their favorites.
DELETE /api/favorites: Allows users to remove a picture from their favorites.