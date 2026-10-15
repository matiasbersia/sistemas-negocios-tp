
const express = require('express');
const app = express();

const eventosRouter = require('./routes/eventosRouter');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use('/', eventosRouter);

module.exports = app;
