
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




module.exports = {
    createUsersTable, createDocumentsTable, createCommentsTable
  };