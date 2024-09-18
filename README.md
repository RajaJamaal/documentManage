On running the server file 'app.js' 
the code creates a database named document_db, 

(all the DB operations are transactional) 

then it creates user table and 
populates 5000 fake users with unique name, username,  join_date and last_login data,

then it creates documents table and,
 for each user we seed 250 documents 'total 1,250,000 documents' in the documents table,

 then it creates 'comments' table,
 for each document it seeds 30,000 comments ' total 37,500,000,000' in the comments table,

 then prints logs of
  different joins,
  timings of optimized and unoptimized queries,

 these millions of data can be used as dummy data by Frontend Developers
