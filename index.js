const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/test', require('./routes/test'));
app.use('/messages', require('./routes/messages'));
app.use('/auth', require('./routes/auth'));


app.get('/', (req, res) => {
  res.redirect("/auth");
});

module.exports = app;
