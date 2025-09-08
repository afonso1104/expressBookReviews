const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
let userWithSameName = users.filter((user) => user.username === username);
if(userWithSameName.length > 0) {
  return false;
}
return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let authenticatedUser = users.filter((user) => user.username === username && user.password === password);
  if(authenticatedUser.length > 0) {
    return true;
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;

  if(!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if(authenticatedUser(username, password)){
    let accessToken = jwt.sign({
      "data":password
    }, "access", {expiresIn: 600});
  

    req.session.authorization = {
      accessToken, username
  }

    return res.status(200).send("User successfully logged in");
  } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
  
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Ensure user is logged in
  const username = req.session?.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "You must be logged in to add a review" });
  }

  // Read inputs
  const isbn = Number(req.params.isbn);
  const message = req.body?.message ?? req.query?.message;

  if (!message) {
    return res.status(400).json({ message: "Review message is required (send in body as { message } or as ?message=...)" });
  }

  // Find the book (books may be an array or an object)
  const book = Array.isArray(books)
    ? books.find(b => b.isbn === isbn)
    : Object.values(books).find(b => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: `Book with the isbn: ${isbn} not found` });
  }

  // Ensure reviews is an object, then save/overwrite review by username
  if (!book.reviews || typeof book.reviews !== "object") {
    book.reviews = {};
  }
  book.reviews[username] = message;

  return res.status(200).json({ message: "Review saved", isbn, username, reviews: book.reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session?.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "You must be logged in to delete a review" });
  }

  const isbn = Number(req.params.isbn);
  const book = Array.isArray(books)
    ? books.find(b => b.isbn === isbn)
    : Object.values(books).find(b => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: `Book with the isbn: ${isbn} not found` });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted", isbn, username, reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
