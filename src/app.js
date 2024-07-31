const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const { checkOverloadConnect } = require('./helpers/check.connect');
const { errorHandler } = require('./middlewares/error.middleware');

dotenv.config();

const app = express();
//connect db
require('./dbs/init.db');
// checkOverloadConnect();
//init middleware
app.use(
  cors({
    origin: ['http://localhost:5173']
  })
);
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//test pub/sub redis
const productTest = require('./test/products.test');

require('./test/inventory2.test');
require('./test/inventory.test');
app.get('/order', async (req, res) => {
  await productTest.orderPro();
  res.send('Order product');
});
//init routes
app.use('/', require('./routes/index'));
//handler error
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});
app.use(errorHandler);
module.exports = app;
