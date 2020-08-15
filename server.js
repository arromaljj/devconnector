const express = require('express');
const connectDB = require('./config/db');
const app = express();

//Connect to Database
connectDB();

// process.env.port will look for a environment variable and set that to its value
// else it will just set it to 5000

//Init Middleware

app.use(express.json({extended: false}));



//Take a get request to . and res.send will send the result to the browser.
app.get('/', (req, res) => res.send('API Running'));

//Define Routes

app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
