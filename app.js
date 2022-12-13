const http = require('http');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
var cors = require('cors');
require('dotenv').config();

var app = express();

// cors options
const corsOpts = {
  origin: '*'
};

// set middlewares
app.use(cors(corsOpts));
app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
app.use('/', require('./routes.js'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const error = new Error('Not Found 404');
  error.status = 404;
  next(error);
});

// error handler
app.use(function(err, req, res) {
  console.log(err.status);
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      error: err
    }
  });
});

// prevent server crash due to the error
process.on("uncaughtException", (error, origin) => {
  console.log("----- Uncaught exception -----");
  console.log(error);
  console.log("----- Exception origin -----");
  console.log(origin);
});

const httpServer = http.createServer(app);
// init socket server
require('./socket').init(httpServer);

// listen server
httpServer.listen(process.env.PORT, () => {
  console.log("Server is running on port: ", process.env.PORT)
});