const express = require('express');
const path = require('path');
const uuid = require('./helpers/uuid');
const fs = require('fs');

const { readFromFile, readAndAppend, readAndDelete } = require('./helpers/fsUtils');
var PORT = process.env.PORT || 8080;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to serve up static assets from the public folder
app.use(express.static('./'));

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/notes.html'))
);

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      note_id: uuid(),
    };

    readAndAppend(newNote, './db/db.json');

    const response = {
      status: 'success',
      body: newNote,
    };

    res.json(response);
  } else {
    res.json('Error in posting note');
  }
});

app.get('/*', (req, res) =>
  res.sendFile(path.join(__dirname, '/index.html'))
);

app.delete('/api/notes/:id', (req, res) =>{
  if (req.params.id) {
    console.info(`${req.method} request received to delete a review`);
    readAndDelete(req.params.id, './db/db.json');
    return res.json(req.params.id);
  } else {
    res.status(400).send('Review ID not provided');
  }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);


