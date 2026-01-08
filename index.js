const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors()); 
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/test", require("./routes/test"));
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
//app.use("/contacts", require("./routes/contacts"));
//app.use("/blocks", require("./routes/blocks"));
app.use("/messages", require("./routes/messages")); // testing
app.use("/conversations", require("./routes/conversations"));
app.use("/groups", require("./routes/groups"));
//app.use("/", require("./routes/"));

module.exports = app;
