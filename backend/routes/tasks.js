const express = require('express');
const r = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getTask } = require('../controllers/main');
const { protect } = require('../middleware/auth');
const { validateTask } = require('../middleware/validate');

r.use(protect);
r.get('/', getTasks);
r.post('/', validateTask, createTask);
r.get('/:id', getTask);
r.put('/:id', updateTask);
r.delete('/:id', deleteTask);

module.exports = r;
