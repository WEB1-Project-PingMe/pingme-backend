const express = require("express");
const cors = require("cors");
const verifyToken = require('./middleware/verifyToken');
const app = express();

app.use(cors()); 
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/test", require("./routes/test"));


app.use("/auth", require("./routes/auth"));
app.use("/users", verifyToken, require("./routes/users"));
//app.use("/contacts", verifyToken, require("./routes/contacts"));
//app.use("/blocks", verifyToken, require("./routes/blocks"));
//app.use("/messages", verifyToken, require("./routes/messages")); // testing
app.use("/conversations", verifyToken, require("./routes/conversations"));
app.use("/groups", verifyToken, require("./routes/groups"));
//app.use("/", require("./routes/"));

module.exports = app;
