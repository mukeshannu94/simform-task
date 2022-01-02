const express = require('express');

const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../controllers/userController');
const userValidator = require('../validators/userValidator');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/profile/'));
  },
  filename(req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    const d = new Date();
    const uniqueFilename = d.getTime();
    cb(null, `${uniqueFilename}.${ext}`);
  },
});
const uploader = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
      return cb(null, true);
    }
    return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  },
}).single('profileImage');

router.post('/login', userValidator.login, User.login);
router.post('/register', userValidator.register, User.register);
router.post('/usersList', auth, User.usersList);
router.get('/userDetail/:_id', auth, userValidator.userDetail, User.userDetail);
router.put('/updateUser/:_id', auth, uploader, userValidator.updateUser, User.updateUser);
router.get('/logout', auth, User.logout);

module.exports = router;
