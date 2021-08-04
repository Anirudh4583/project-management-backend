const express = require('express');

const app = express();

// const PORT = process.env.PORT || 3000;

const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

var UserController = require('./routers/login');

app.use('/auth', UserController);

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

module.exports = app;
