const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
// @route   GET api/auth
// @desc    Register User
// @access  Public

router.get('/', auth, async (req, res) => {
  //   console.log(req.body);

  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const userPostValidate = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

const userRegistrationPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;

  try {
    //See if user exits
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: [{ msg: 'Invalid Credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: [{ msg: 'Invalid Credentials' }] });
    }
    //Return jsonwebtoken
    const payload = {
      user: {
        id: user.id
      }
    };
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      {
        expiresIn: 360000
      },
      (err, token) => {
        if (err) throw err;
        res.json({ "token": token, "status": "successful" });
      }
    );
    //   res.send("Success");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/users
// @desc    Test route
// @access  Public
router.post('/', userPostValidate, userRegistrationPost);

module.exports = router;
