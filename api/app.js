const express = require('express');

const app = express();
const http = require('http');
const helmet = require('helmet');
const logger = require('morgan');
const console = require('console');
const path = require('path');
const compression = require('compression');
const { errors } = require('celebrate');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config.json');
const db = require('./config/database.json');

const PORT = process.env.PORT || config.port;
const connString = `mongodb://${db[config.environment].host}:${db[config.environment].port}/${db[config.environment].database}?authSource=admin&w=1`;
mongoose.connect(connString, {
  auth: {
    username: db[config.environment].user,
    password: db[config.environment].password,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Successfully connect to MongoDB.');
  })
  .catch((err) => {
    console.error('Connection error', err);
  });

app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.use(logger('dev'));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: 'false' }));
app.use(express.static(path.join(__dirname, '../user/dist/user')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./routes'));

app.use(errors());

app.use(/^((?!(api)).)*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../user/dist/user/index.html'));
});
const httpServer = http.createServer(app);
httpServer.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`http server running on port ${PORT}`);
});
