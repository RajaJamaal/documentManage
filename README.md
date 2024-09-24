Document Management System
Overview
This project implements a Document Management System using Node.js and PostgreSQL. It utilizes the Faker library to generate dummy user, document, and comment data, and performs various SQL operations to manage and analyze the data stored in the database.

Features
Create and manage users, documents, and comments.
Generate fake data for testing and development purposes.
Perform complex SQL queries, including joins and aggregates.
Transactional control for database operations to ensure data integrity.
Database performance optimization through indexing and query optimization.
Requirements
Node.js (v14 or higher)
PostgreSQL (v12 or higher)
NPM packages:
@faker-js/faker
pg
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/document-management-system.git
cd document-management-system
Install dependencies:

bash
Copy code
npm install
Set up PostgreSQL:

Ensure PostgreSQL is running on your machine.
Create a database user and a database if they don't exist. The default setup uses:
User: postgres
Password: root
Default database: postgres
Usage
Create the database: The createDatabase function checks for the existence of the document_db database and creates it if necessary.

Connect to the database and create tables: The connectToDatabase function checks if the necessary tables (users, documents, comments) exist and creates them if not.

Seed the database with fake data: If the database is empty, the application will generate:

5000 users
125,000 documents (25 documents per user)
1,500,000 comments (30 comments per document)
Run the application: Execute the following command to run the application:

bash
Copy code
node app.js
SQL Queries
This application includes a variety of SQL queries for different operations:

Table Creation:

createUsersTable
createDocumentsTable
createCommentsTable
Joins:

innerJoin
leftJoin
rightJoin
fullOuterJoin
Aggregates:

countDocuments
averageCommentPerDocument
latestLogin
userWithMostComments
firstCommentUser
totalRowsInAllTables
concatNameAndMail
daysSinceLastLogin
averageDocumentCreationTime
userWithMostDocumentUpdates
Performance Optimization:

Unoptimized and optimized queries to demonstrate performance differences.
Data Integrity Checks:

Check for duplicate emails in the user table.
Contributions
Feel free to fork this repository and submit pull requests for any enhancements or bug fixes.

License
This project is licensed under the MIT License. See the LICENSE file for more details.