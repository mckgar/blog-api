require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const routes = require('./routes/index');

const app = express();

// DB setup
const mongoDb = process.env.DB_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/user', routes.user);
app.use('/login', routes.login);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
});
