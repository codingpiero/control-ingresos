const express = require('express');
const authController = require('../controllers/auth.controller');
const {redirectIfAuth} =require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/login',redirectIfAuth, authController.loginForm);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

module.exports = router;