const {faker} = require('@faker-js/faker')
const { Client } = require("pg");
const {
  createUsersTable,
  createDocumentsTable,
  createCommentsTable,
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

    // await client.query(`DROP DATABASE document_db;`);
    

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

  // await client.query(`DROP DATABASE document_db;`);

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

  // for (let i = 0; i < 5000; i++) {
  //   const element = array[i];

  // }
  let emailCount = 0;

  const generateUser = () => ({
    name: faker.internet.userName(),
    email: `${faker.internet.userName()}_${emailCount++}@fakemail.com`,
    join_date: faker.date.past(),
    last_login: faker.date.recent(),
  });
  
  const users = Array.from({ length: 5000 }, generateUser);
  
  const insertUser = async (user) => {
    const newUser = await newClient.query(`INSERT INTO users (name, email, join_date, last_login) VALUES ($1, $2, $3, $4) RETURNING id`, [user.name, user.email, user.join_date, user.last_login]);
    user.id = newUser.rows[0].id;
    console.log(`user ${user.name} added to DB with id: ${user.id}`);

    return user;
  };

  for (const user of users) {
    await insertUser(user);
    console.log(` user.name=${user.name}   with user.id=${user.id}  added to DB`); 
    
    const generateDocs = () => ({
      created_by: user.id,
      title: faker.lorem.sentence(5),
      description: faker.lorem.paragraph(5),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    });

    console.log("created_by", user.id);

    const documents = Array.from({ length: 250 }, generateDocs);

    const insertDoc = async (doc) => {
      const newDoc = await newClient.query(`INSERT INTO documents (created_by, title, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [doc.created_by, doc.title, doc.description, doc.created_at, doc.updated_at]);
      doc.id = newDoc.rows[0].id;
      console.log(`doc.id=${doc.id} added to DB by user.id=${user.id}`);

    };

    for (doc of documents){
      await insertDoc(doc);
      console.log(` user.id =${user.id} added doc.id= ${doc.id} to DB`); 
    };
 
  };

  const generateComments = () => ({
    created_by: Math.floor(Math.random() * 5000) + 1,
    commented_on: Math.floor(Math.random() * 1250000) + 1,
    title: faker.lorem.sentence(5),
    description: faker.lorem.paragraph(5),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  });

  const comments = Array.from({ length: 30000 }, generateComments);

  const insertComment = async (comment) => {
    const newComment = await newClient.query(`INSERT INTO comments (created_by, commented_on, title, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)`, [comment.created_by, comment.commented_on, comment.title, comment.description, comment.created_at, comment.updated_at]);
  };

  for (comment of comments){
    await insertComment(comment);
    console.log(` user ${comment.created_by} commented on ${comment.commented_on} to DB`); 
  };
};

createDatabase("document_db")
  .then(() => connectToDatabase("document_db"))
  .catch(console.error);
