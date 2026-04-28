const express = require('express');
const r = express.Router();
const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/main');
const { protect } = require('../middleware/auth');
const { validateNote } = require('../middleware/validate');

r.use(protect);
r.get('/', getNotes);
r.post('/', validateNote, createNote);
r.put('/:id', updateNote);
r.delete('/:id', deleteNote);

module.exports = r;
