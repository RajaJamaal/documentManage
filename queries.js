// queries.js
const createUsersTable = `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    join_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const createDocumentsTable = `CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    created_by INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL
);`;

const createCommentsTable = `CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    created_by INTEGER REFERENCES users(id),
    commented_on INTEGER REFERENCES documents(id),
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL
);`;

const innerJoin = `SELECT * FROM users 
    INNER JOIN documents ON users.id = documents.created_by 
    INNER JOIN comments ON documents.id = comments.commented_on
    LIMIT 10;`;

const leftJoin = `SELECT * FROM users 
    LEFT JOIN documents ON users.id = documents.created_by
    LEFT JOIN comments ON documents.id = comments.commented_on
    LIMIT 10;`;

const rightJoin = `SELECT * FROM users 
    RIGHT JOIN documents ON users.id = documents.created_by
    RIGHT JOIN comments ON documents.id = comments.commented_on
    LIMIT 10;`;

const fullOuterJoin = `SELECT * FROM users
    FULL OUTER JOIN documents ON users.id = documents.created_by
    FULL OUTER JOIN comments ON documents.id = comments.commented_on
    LIMIT 10;`;

const countDocuments = `SELECT COUNT(*) AS "Total number of records" FROM documents;`;

const averageCommentPerDocument = `SELECT AVG(comment_count) as avg_comments
    FROM (
    SELECT documents.id, COUNT(comments.id) as comment_count
    FROM documents
    LEFT JOIN comments ON documents.id = comments.commented_on
    GROUP BY documents.id
    ) as comment_counts;`;

const latestLogin =`SELECT MAX(last_login) AS latest_login
    FROM users;
    `;

const userWithMostComments = `SELECT u.id, u.name
    FROM users AS u
    INNER JOIN (
    SELECT created_by, COUNT(*) AS max_comments
    FROM comments
     GROUP BY created_by
        ) AS c ON u.id = c.created_by
        WHERE c.max_comments = (
        SELECT MAX(max_comments)
            FROM (
            SELECT created_by, COUNT(*) AS max_comments
            FROM comments
            GROUP BY created_by
            ) AS inner_subquery
    );
    `;


module.exports = {
  createUsersTable,
  createDocumentsTable,
  createCommentsTable,
  innerJoin,
  leftJoin,
  rightJoin,
  fullOuterJoin,
  countDocuments,
  averageCommentPerDocument,
  latestLogin,
  userWithMostComments,
};
