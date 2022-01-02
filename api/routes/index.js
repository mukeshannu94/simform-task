const express = require('express');

const router = express.Router();
const user = require('./user');

router.get('/api/v1/user', (req, res) => {
  res.send('Welcome to  Apis');
});
router.use('/api/v1/user', user);

module.exports = router;
