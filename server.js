const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passportConfig = require("./middleware/passportConfig");
const cors = require("cors");
const path = require("path"); // Add this line if not already included
require("dotenv").config();

const initRouter = require("./routes");

app.use((req, res, next) => {
  console.log(`\x1b[42m ${req.method} ${req.url} request received.\x1b[0m`);
  next();
});

// Connect to MongoDB
mongoose    
  .connect(
    process.env.MONGO_URL
  )
  .then(() => console.log("Connected successfully to DB"))
  .catch((err) => console.error(err));

// Create an Express application, set port for server
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(passportConfig.initialize());
app.use(cors());

// Serve static files

// Serve static files for all uploads (logos and covers)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

initRouter(app);

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}!`);  
});
