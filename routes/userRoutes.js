const express = require('express');
const authController = require('../controllers/authControllers');
const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);

module.exports = router;
