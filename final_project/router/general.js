const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get all books (async/await)
const getBooks = () => new Promise((resolve) => resolve(books));

public_users.get('/', async (req, res) => {
  const allBooks = await getBooks();
  return res.status(200).send(JSON.stringify(allBooks, null, 4));
});

// Get book by ISBN (Promise)
public_users.get('/isbn/:isbn', (req, res) => {
  new Promise((resolve, reject) => {
    const book = books[req.params.isbn];
    book ? resolve(book) : reject("Book not found");
  })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err }));
});

// Get books by author (async/await)
public_users.get('/author/:author', async (req, res) => {
  const all = await getBooks();
  const author = req.params.author.toLowerCase();
  const result = Object.keys(all)
    .filter(isbn => all[isbn].author.toLowerCase() === author)
    .map(isbn => ({ isbn, ...all[isbn] }));
  if (result.length === 0) return res.status(404).json({ message: "No books found for this author" });
  return res.status(200).json(result);
});

// Get books by title (async/await)
public_users.get('/title/:title', async (req, res) => {
  const all = await getBooks();
  const title = req.params.title.toLowerCase();
  const result = Object.keys(all)
    .filter(isbn => all[isbn].title.toLowerCase() === title)
    .map(isbn => ({ isbn, ...all[isbn] }));
  if (result.length === 0) return res.status(404).json({ message: "No books found with this title" });
  return res.status(200).json(result);
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

// ---- Axios client functions (Tasks 10-13) ----
const BASE_URL = "http://localhost:5000";

// Task 10: all books with async/await
async function getAllBooksAxios() {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
}

// Task 11: by ISBN with Promise callbacks
function getBookByISBNAxios(isbn) {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => response.data)
    .catch(error => { throw error; });
}

// Task 12: by author with async/await
async function getBooksByAuthorAxios(author) {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
}

// Task 13: by title with async/await
async function getBooksByTitleAxios(title) {
  const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
}

module.exports.general = public_users;
module.exports.getAllBooksAxios = getAllBooksAxios;
module.exports.getBookByISBNAxios = getBookByISBNAxios;
module.exports.getBooksByAuthorAxios = getBooksByAuthorAxios;
module.exports.getBooksByTitleAxios = getBooksByTitleAxios;
