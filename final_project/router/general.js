const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (!isValid(username)) {
    return res.status(400).json({message: "User already exists"});
  }
  users.push({username: username, password: password});
  return res.status(200).json({message: "User successfully registered"});

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(books);
});

public_users.get('/axios/books', async (req, res) => {
  try {
    const response = await axios.get("http://localhost:4444/");
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao obter livros", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using axios (async/await)
public_users.get('/axios/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:4444/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message;
    return res.status(status).json({ message });
  }
});

// Task 12: Get book details based on Author using axios (async/await)
public_users.get('/axios/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:4444/author/${author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message;
    return res.status(status).json({ message });
  }
});

public_users.get('/axios/title/:title', async(req,res) => {
  try {
    const title = req.params.title;
    const response = await axios.get(`http://localhost:4444/title/${title}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message;
    return res.status(status).json({ message });
  }
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = parseInt(req.params.isbn);
  let filteredBooks = books.filter((book) => book.isbn === isbn);
  if(filteredBooks.length > 0) {
    res.send(filteredBooks);
    return;
  }
  res.send(`Book with the isbn: ${isbn} not found`);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  let filteredBooks = books.filter((book) => book.author === author);
  if(filteredBooks.length > 0) {
    res.send(filteredBooks); 
    return;
  }
  res.send(`Book with author: ${author} not found`)
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  let filteredBooks = books.filter((book) => book.title === title);
  if(filteredBooks.length > 0) {
    res.send(filteredBooks);
    return;
  }
  res.send(`Book with the title: ${title} not found`);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = parseInt(req.params.isbn);
  let filteredBooks = books.filter((book) => book.isbn === isbn);
  if(filteredBooks.length > 0) {
    res.send(filteredBooks[0].reviews);
  }
  res.send(`Book with the isbn ${isbn} not found`);
});

module.exports.general = public_users;
