const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');

const app = express();

//init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
//handler error

app.get('/', (req, res, next) => {
  const strCompress = 'Hello World';
  return res.status(200).json({ message: strCompress });
});

module.exports = app;
