const express = require('express');

const app = express();

const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));


var UserController = require("./routers/login");
var NewAnnouncement = require("./routers/announcement");
app.use('/api/auth', UserController);
app.use('/api/announcement', NewAnnouncement);



module.exports = app;
