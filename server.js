const express = require("express");
const app = express();
// process.env.port will look for a environment variable and set that to its value
// else it will just set it to 5000

//Take a get request to . and res.send will send the result to the browser.
app.get('/', (req, res) => res.send("API Running"))


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
