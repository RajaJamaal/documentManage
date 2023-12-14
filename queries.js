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
    LIMIT 5;`;

const leftJoin = `SELECT * FROM users 
    LEFT JOIN documents ON users.id = documents.created_by
    LEFT JOIN comments ON documents.id = comments.commented_on
    LIMIT 3;`;

const rightJoin = `SELECT * FROM users 
    RIGHT JOIN documents ON users.id = documents.created_by
    RIGHT JOIN comments ON documents.id = comments.commented_on
    LIMIT 3;`;

const fullOuterJoin = `SELECT * FROM users
    FULL OUTER JOIN documents ON users.id = documents.created_by
    FULL OUTER JOIN comments ON documents.id = comments.commented_on
    LIMIT 3;`;

const countDocuments = `SELECT COUNT(*) AS "Total number of records" FROM documents;`;

const averageCommentPerDocument = `SELECT AVG(comment_count) as avg_comments
    FROM (
    SELECT documents.id, COUNT(comments.id) as comment_count
    FROM documents
    LEFT JOIN comments ON documents.id = comments.commented_on
    GROUP BY documents.id
    ) as comment_counts;`;

const latestLogin = `SELECT MAX(last_login) AS latest_login
    FROM users;
    `;

const userWithMostComments = `SELECT u.id, LOWER(u.name), c.comments_count
    FROM users AS u
    INNER JOIN (
    SELECT created_by, COUNT(*) AS comments_count
    FROM comments
     GROUP BY created_by
        ) AS c ON u.id = c.created_by
        WHERE c.comments_count = (
        SELECT MAX(comments_count)
            FROM (
            SELECT created_by, COUNT(*) AS comments_count
            FROM comments
            GROUP BY created_by
            ) AS inner_subquery
    );
    `;

const firstCommentUser = `SELECT UPPER(users.name), MIN(comments.created_at) as first_comment_time
    FROM comments
    INNER JOIN users ON comments.created_by = users.id
    GROUP BY users.name
    ORDER BY first_comment_time
    LIMIT 1;`;

const totalRowsInAllTables = `SELECT 
    (SELECT COUNT(*) FROM users) +
    (SELECT COUNT(*) FROM documents) +
    (SELECT COUNT(*) FROM comments) AS total_rows;`;

const concatNameAndMail = `SELECT CONCAT(name, ',  ' , email) AS concat_Name_Email FROM users WHERE name = 'Regan_Kertzmann' LIMIT 2;`;

const currentTimestamp = `SELECT CURRENT_TIMESTAMP;`;

const daysSinceLastLogin = `SELECT name, EXTRACT(DAY FROM AGE(CURRENT_TIMESTAMP, last_login)) AS days_since_last_login
    FROM users
    ORDER BY 
    last_login DESC
    LIMIT 3;
    `;

const joiningYear = `SELECT DATENAME(year, join_date) AS joining_year
    FROM users WHERE email="Anderson_Nienow74_149@fakemail.com";`;

const averageDocumentCreationTime = `WITH DocumentCreationTimes AS (
        SELECT 
            created_by,
            AVG(EXTRACT(EPOCH FROM (created_at - join_date))) AS avg_creation_time_seconds
        FROM 
            documents
        INNER JOIN 
            users ON documents.created_by = users.id
        GROUP BY 
            created_by
    )
    SELECT 
        u.id AS user_id,
        u.name AS user_name,
        DCT.avg_creation_time_seconds
    FROM 
        users u
    LEFT JOIN 
        DocumentCreationTimes DCT ON u.id = DCT.created_by
    LIMIT 3;
    `;

const userWithMostDocumentUpdates = `WITH UserUpdatedDocumentCount AS (
    SELECT 
        created_by,
        COUNT(updated_at) AS updated_document_count
    FROM 
        documents
    GROUP BY 
        created_by
    ORDER BY 
        updated_document_count DESC
    LIMIT 10
    )
    SELECT 
    u.id AS user_id,
    u.name AS user_name,
    COALESCE(UDC.updated_document_count, 0) AS updated_document_count
    FROM 
    users u
    LEFT JOIN 
    UserUpdatedDocumentCount UDC ON u.id = UDC.created_by
    LIMIT 3;
    `;

// unoptimized query and optimized queries
const unoptimizedQuery = `SELECT COUNT(*) AS no_comments_docs_count
FROM documents d
WHERE d.id NOT IN (
    SELECT DISTINCT commented_on
    FROM comments
    WHERE commented_on IS NOT NULL
);`;
const optimizedQuery = `SELECT COUNT(*) AS no_comments_docs_count
    FROM documents d
    LEFT JOIN comments c ON d.id = c.commented_on
    WHERE c.commented_on IS NULL;
    ;`;

const unoptimizedQuery2 = `SELECT * FROM documents;`;
const optimizedQuery2 = `SELECT id, title FROM documents;`;

const duplicateEmailCheck = `SELECT email, COUNT(*)
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1;`;

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
  firstCommentUser,
  totalRowsInAllTables,
  concatNameAndMail,
  currentTimestamp,
  daysSinceLastLogin,
  joiningYear,
  averageDocumentCreationTime,
  userWithMostDocumentUpdates,
  unoptimizedQuery,
  optimizedQuery,
  unoptimizedQuery2,
  optimizedQuery2,
  duplicateEmailCheck,
};
