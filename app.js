require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// DB setup
const mongoDb = process.env.DB_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
});
