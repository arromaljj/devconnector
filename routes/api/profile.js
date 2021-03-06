const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');

const { check, validationResult } = require('express-validator');

// @route   GET api/profile
// @desc    Create or update user profile
// @access  Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //build profile object
    const varList = [
      'company',
      'website',
      'location',
      'bio',
      'status',
      'githubusername',
      'skills'
    ];
    const socialList = [
      'youtube',
      'facebook',
      'twitter',
      'instagram',
      'linkedin'
    ];

    const profileFields = {};
    profileFields.social = {};
    profileFields.user = req.user.id;
    for (var i = 0; i < varList.length; i++) {
      if (eval(varList[i])) {
        eval('profileFields.' + varList[i] + ' = ' + varList[i]);
      }
      if (varList[i] == 'skills' && eval(varList[i])) {
        temp = eval(varList[i]);
        profileFields.skills = skills.split(',').map(skill => skill.trim());
      }
    }
    for (var i = 0; i < socialList.length; i++) {
      if (eval(socialList[i])) {
        eval('profileFields.social.' + socialList[i] + ' = ' + socialList[i]);
      }
    }
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //Update

        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({
        msg: 'There is no profile for this user'
      });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/user_id
// @desc    Get profile by user id
// @access  Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private

router.delete('/', auth, async (req, res) => {
  try {
    //@todo - remove users posts
    // Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted' });
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Could not delete user' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
