// app.js
const { faker } = require("@faker-js/faker");
const { Client } = require("pg");
const {
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
} = require("./queries");

const createDatabase = async (postgres) => {
  const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "root",
    database: "postgres", // connect to the default database
  });

  await client.connect();

  try {
    // Check if database already exists
    const exists = await client.query(
      `SELECT 1 FROM pg_catalog.pg_database WHERE datname = $1`,
      ["document_db"]
    );

    if (!exists.rows.length) {
      // Database doesn't exist, so create it
      await client.query(`CREATE DATABASE document_db;`);
      console.log(`new Database document_db created successfully.`);
    } else {
      console.log(`Database document_db already exists.`);
    }
  } catch (error) {
    console.error(`Error creating or checking database: ${error}`);
  }

  await client.end(); // close connection to default database
};

const connectToDatabase = async (document_db) => {
  const newClient = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "root",
    database: document_db, // connect to the new database
  });

  await newClient.connect();
  try {
    // Check if users table exists
    let exists;
    exists = await newClient.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'users';`
    );

    if (!exists.rows.length) {
      await newClient.query(createUsersTable);
      console.log("documents Table created successfully");
    }

    // Check if documents table exists
    exists = await newClient.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'documents';`
    );

    if (!exists.rows.length) {
      await newClient.query(createDocumentsTable);
      console.log("documents Table created successfully");
    }

    // Check if comments table exists
    exists = await newClient.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'comments';`
    );

    if (!exists.rows.length) {
      await newClient.query(createCommentsTable);
      console.log("comments Table created successfully");
    } else {
      console.log("Tables already exist. Skipping creation.");
    }
  } catch (error) {
    console.error("ERROR creating tables", error);
  }

  console.log("Checking if DB is populated...");

  const populationCheck = await newClient.query(
    "SELECT id FROM users WHERE id = 5000;"
  );
  if (!populationCheck) {
    // seeding fake data
    console.log("DB is empty, populating fake data");

    for (let i = 0; i < 5000; i++) {
      const element = array[i];
    }
    let emailCount = 0;

    const generateUser = () => ({
      name: faker.internet.userName(),
      email: `${faker.internet.userName()}_${emailCount++}@fakemail.com`,
      join_date: faker.date.past(),
      last_login: faker.date.recent(),
    });

    const users = Array.from({ length: 5000 }, generateUser);

    const insertUser = async (user) => {
      try {
        // Transactional Control implemented during user insertion
        await newClient.query("BEGIN");

        // Insert the user
        const newUser = await newClient.query(
          `INSERT INTO users (name, email, join_date, last_login) VALUES ($1, $2, $3, $4) RETURNING id`,
          [user.name, user.email, user.join_date, user.last_login]
        );

        // If the insert was successful, commit the transaction
        await newClient.query("COMMIT");

        user.id = newUser.rows[0].id;
        console.log(`user ${user.name} added to DB with id: ${user.id}`);

        return user;
      } catch (error) {
        // If there was an error, rollback the transaction
        await newClient.query("ROLLBACK");

        // Log the error
        console.error("An error occurred while INSERTING new user:", error);
      }
    };

    for (const user of users) {
      await insertUser(user);
      console.log(
        ` user.name=${user.name}   with user.id=${user.id}  added to DB`
      );

      const generateDocs = () => ({
        created_by: user.id,
        title: faker.lorem.sentence(5),
        description: faker.lorem.paragraph(5),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      });

      console.log("created_by", user.id);

      const documents = Array.from({ length: 25 }, generateDocs);

      const insertDoc = async (doc) => {
        try {
          // Transactional Control implemented during document insertion

          await newClient.query("BEGIN");

          const newDoc = await newClient.query(
            `INSERT INTO documents (created_by, title, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [
              doc.created_by,
              doc.title,
              doc.description,
              doc.created_at,
              doc.updated_at,
            ]
          );

          // If the insert was successful, commit the transaction
          await newClient.query("COMMIT");
          doc.id = newDoc.rows[0].id;
          console.log(`doc.id=${doc.id} added to DB by user.id=${user.id}`);
        } catch (error) {
          // If there was an error, rollback the transaction
          await newClient.query("ROLLBACK");
          // Log the error
          console.error(
            "An error occurred while inserting new document!:",
            error
          );
        }
      };

      for (doc of documents) {
        await insertDoc(doc);
        console.log(` user.id =${user.id} added doc.id= ${doc.id} to DB`);
      }
    }

    const generateComments = () => ({
      created_by: Math.floor(Math.random() * 5000) + 1,
      commented_on: Math.floor(Math.random() * 1250000) + 1,
      title: faker.lorem.sentence(5),
      description: faker.lorem.paragraph(5),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    });

    const comments = Array.from({ length: 30 }, generateComments);

    const insertComment = async (comment) => {
      try {
        // Transactional Control implemented during comment insertion
        await newClient.query("BEGIN");

        const newComment = await newClient.query(
          `INSERT INTO comments (created_by, commented_on, title, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            comment.created_by,
            comment.commented_on,
            comment.title,
            comment.description,
            comment.created_at,
            comment.updated_at,
          ]
        );

        await newClient.query("COMMIT");
      } catch (error) {
        // If there was an error, rollback the transaction
        await newClient.query("ROLLBACK");

        // Log the error
        console.error(
          "An error occurred while INSERTING  new comment!!:",
          error
        );
      }
    };

    for (comment of comments) {
      await insertComment(comment);
      console.log(
        ` user ${comment.created_by} commented on ${comment.commented_on} to DB`
      );
    }
  }

  console.log("DB is already populated, skipping data seeding...");
  await newClient.query(`DROP INDEX idx_users_id;`);
  await newClient.query(`DROP INDEX idx_documents_created_by;`);
  await newClient.query(`DROP INDEX idx_comments_commented_on;`);

  //==============================================================================================================
  // ////// Queries using different types of joins to fetch combined data from the users, documents and comments tables

  // // INNER-JOIN => This query retrieves all documents and their corresponding user and comments
  const innerJoinData = await newClient.query(innerJoin);
  console.log("inner-Join-Data", innerJoinData.rows);

  // // LEFT-JOIN => returns a table with all users, even if they haven't created any documents or written any comments. It will also include all documents, even if they haven't received any comments.
  const leftJoinData = await newClient.query(leftJoin);
  console.log("LEFT-Join-Data", leftJoinData.rows);

  // // RIGHT-JOIN => return a table with all documents, even if they haven't been created by any users or received any comments.
  // // It will also include all comments including ORPHANS
  const rightJoinData = await newClient.query(rightJoin);
  console.log("RIGHT-Join-Data", rightJoinData.rows);

  // // FULL-OUTER-JOIN => returnS a table with all users+documents+comments, regardless of whether they have any relationships with each other
  const fullOuterJoinData = await newClient.query(fullOuterJoin);
  console.log("FULL-OUTER-join-Data", fullOuterJoinData.rows);

  //=========================================================================================================================
  // Using aggregate functions like COUNT, AVG, MAX, MIN, SUM to analyze data (e.g., average number of comments per document).
  // COUNT => Returns the total count of docs in document table
  const totalDocuments = await newClient.query(countDocuments);
  console.log(
    `totalDocuments = ${totalDocuments.rows[0]["Total number of records"]}`
  );

  // AVERAGE() => average number of comments per document
  const averageCommPerDoc = await newClient.query(averageCommentPerDocument);
  console.log(
    `averageCommentPerDocument = ${averageCommPerDoc.rows[0].avg_comments}`
  );

  // MAX()  => using "max function" on last_login to fetch latest login time
  const latestLoginTime = await newClient.query(latestLogin);
  console.log(`latestLoginTime = ${latestLoginTime.rows[0].latest_login}`);

  // MAX()  => using "max function" and "inner queries/sub-queries" to query user with most comments
  // STRING FUNCTIONS => Using LOWER() to LOWERCASE userName
  const usersWithMostComments = await newClient.query(userWithMostComments);
  console.log("usersWithMostComments", usersWithMostComments.rows);

  // MIN()  => using "min function" to fetch document title and username of ten earliest comments
  // STRING FUNCTIONS => Using UPPER() to capitalize userName
  const firstCommentUserdata = await newClient.query(firstCommentUser);
  console.log("firstCommentUserdata", firstCommentUserdata.rows);

  // SUM => using "sum function" we are finding the sum of count of data across all tables
  const SumOfCountOfRowsAcrossDB = await newClient.query(totalRowsInAllTables);
  console.log("SumOfCountOfRowsAcrossDB", SumOfCountOfRowsAcrossDB.rows);

  // STRING FUNCTIONS => Using "CONCAT()" to stitch name and email of a certain user
  const concatNameAndMailData = await newClient.query(concatNameAndMail);
  console.log("concatNameAndMailData", concatNameAndMailData.rows);

  // SQL DATE FUNCTIONS => CURRENT_TIMESTAMP
  const currentTimestampData = await newClient.query(currentTimestamp);
  console.log("currentTimestampData", currentTimestampData.rows);

  // SQL DATE FUNCTIONS => using PSQL "EXTRACT() and AGE()" to calculate the number of days since last login of certain users
  const daysSinceLastLoginData = await newClient.query(daysSinceLastLogin);
  console.log("daysSinceLastLoginData", daysSinceLastLoginData.rows);

  // SQL DATE FUNCTIONS => using SQL DATENAME(year, join_date) to extract joining year
  // const joiningYearData = await newClient.query(joiningYear);
  // console.log("joiningYearData", joiningYearData.rows);

  // / SQL DATE FUNCTIONS => using SQL CTE to calculate average doc creation time of first few users
  const averageDocumentCreationTimeData = await newClient.query(
    averageDocumentCreationTime
  );
  console.log(
    "averageDocumentCreationTimeData",
    averageDocumentCreationTimeData.rows
  );

  // / SQL DATE FUNCTIONS => using SQL CTE to calculate users with most doc updates
  const userWithMostDocumentUpdatesData = await newClient.query(
    userWithMostDocumentUpdates
  );
  console.log(
    "userWithMostDocumentUpdatesData =",
    userWithMostDocumentUpdatesData.rows
  );

  // ===================================================================================================
  /**Performance Optimization:**
Data Integrity Checks:**

- Create queries to check the integrity of the data (e.g., ensuring no comments exist for non-existing documents).

Transactional Control:**

- Write SQL scripts that use transactions to ensure data integrity during multiple insert/update/delete operations.

#### Additional Challenges:

Security Best Practices:** Implement views or stored procedures that follow security best practices.

Reporting:** Design queries that could be used for reporting purposes, like user activity over time or most commented documents.

Database Administration:** Include tasks on backup strategies or replication setups. */

  // Performance Optimization of SQL Queries
  console.time("Unoptimized-QUERY");
  await newClient.query(unoptimizedQuery);
  console.timeEnd("Unoptimized-QUERY");

  console.time("Optimized-QUERY");
  await newClient.query(optimizedQuery);
  console.timeEnd("Optimized-QUERY");
  /////////////////////////////////////
  console.time("Unoptimized-QUERY-2");
  await newClient.query(unoptimizedQuery2);
  console.timeEnd("Unoptimized-QUERY-2");

  console.time("Optimized-QUERY-2");
  await newClient.query(optimizedQuery2);
  console.timeEnd("Optimized-QUERY-2");

  // query execution time of the already used JOIN QUERIES
  console.log("BEFORE CREATING INDEXES.....");
  console.time("innerJoin-QUERY");
  await newClient.query(innerJoin);
  console.timeEnd("innerJoin-QUERY");

  console.time("leftJoin-QUERY");
  await newClient.query(leftJoin);
  console.timeEnd("leftJoin-QUERY");

  console.time("rightJoin-QUERY");
  await newClient.query(rightJoin);
  console.timeEnd("rightJoin-QUERY");

  console.time("fullOuterJoin-QUERY");
  await newClient.query(fullOuterJoin);
  console.timeEnd("fullOuterJoin-QUERY");

  // creating indexes
  console.log("-------------CREATING INDEXES");
  await newClient.query(`CREATE INDEX idx_users_id ON users(id);`);
  await newClient.query(
    `CREATE INDEX idx_documents_created_by ON documents(created_by);`
  );
  await newClient.query(
    `CREATE INDEX idx_comments_commented_on ON comments(commented_on);`
  );
  console.log(" ----------------INDEXES CREATED! Running join queries again..");

  console.time("innerJoin-QUERY");
  await newClient.query(innerJoin);
  console.timeEnd("innerJoin-QUERY");

  console.time("leftJoin-QUERY");
  await newClient.query(leftJoin);
  console.timeEnd("leftJoin-QUERY");

  console.time("rightJoin-QUERY");
  await newClient.query(rightJoin);
  console.timeEnd("rightJoin-QUERY");

  console.time("fullOuterJoin-QUERY");
  await newClient.query(fullOuterJoin);
  console.timeEnd("fullOuterJoin-QUERY");

  // ===================================================
  // Data Integrity Check => Searching for duplicate emails
  const duplicateEmailCheckData = await newClient.query(duplicateEmailCheck);
  if (!duplicateEmailCheckData.rows.length) {
    console.log(`.
    duplicateEmailCheck = NO duplicate EMAIL found!!!`);
  }
};

createDatabase("document_db")
  .then(() => connectToDatabase("document_db"))
  .catch(console.error);
