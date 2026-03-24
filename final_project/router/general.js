const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ---------------------
// Register new user
// ---------------------
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "User already exists" });
    }

    users.push({ username, password });

    return res.status(200).json({ message: "User registered successfully" });
});

// ---------------------
// Get all books (sync)
// ---------------------
public_users.get('/', function (req, res) {
    return res.status(200).json(JSON.stringify(books, null, 2));
});

// ---------------------
// Get book by ISBN (sync)
// ---------------------
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// ---------------------
// Get book by author (sync)
// ---------------------
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    let filteredBooks = {};

    Object.keys(books).forEach((key) => {
        if (books[key].author.toLowerCase() === author) {
            filteredBooks[key] = books[key];
        }
    });

    return res.status(200).json(filteredBooks);
});

// ---------------------
// Get book by title (sync)
// ---------------------
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    let filteredBooks = {};

    Object.keys(books).forEach((key) => {
        if (books[key].title.toLowerCase() === title) {
            filteredBooks[key] = books[key];
        }
    });

    return res.status(200).json(filteredBooks);
});

// ---------------------
// Get book reviews (sync)
// ---------------------
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// ---------------------
// Async routes using Promises / async-await
// ---------------------

// Get all books (async)
public_users.get('/async/books', async (req, res) => {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) resolve(JSON.stringify(books, null, 2));
                else reject("No books found");
            });
        };

        const allBooks = await getBooks();
        return res.status(200).json(allBooks);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
});

// Get book by ISBN (async)
public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                const book = books[isbn];
                if (book) resolve(book);
                else reject("Book not found");
            });
        };

        const book = await getBookByISBN(isbn);
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get books by author (async)
public_users.get('/async/author/:author', async (req, res) => {
    try {
        const author = req.params.author.toLowerCase();

        const getBooksByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                let filteredBooks = {};
                Object.keys(books).forEach((key) => {
                    if (books[key].author.toLowerCase() === author) {
                        filteredBooks[key] = books[key];
                    }
                });
                if (Object.keys(filteredBooks).length > 0) resolve(filteredBooks);
                else reject("No books found for this author");
            });
        };

        const booksByAuthor = await getBooksByAuthor(author);
        return res.status(200).json(booksByAuthor);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get books by title (async)
public_users.get('/async/title/:title', async (req, res) => {
    try {
        const title = req.params.title.toLowerCase();

        const getBooksByTitle = (title) => {
            return new Promise((resolve, reject) => {
                let filteredBooks = {};
                Object.keys(books).forEach((key) => {
                    if (books[key].title.toLowerCase() === title) {
                        filteredBooks[key] = books[key];
                    }
                });
                if (Object.keys(filteredBooks).length > 0) resolve(filteredBooks);
                else reject("No books found with this title");
            });
        };

        const booksByTitle = await getBooksByTitle(title);
        return res.status(200).json(booksByTitle);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

module.exports.general = public_users;
