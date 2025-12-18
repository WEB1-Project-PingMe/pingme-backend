const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/test', require('./routes/test'));

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
