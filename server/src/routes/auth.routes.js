const express = require('express');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { loginSchema, registerSchema } = require('../validators/schemas');
const { login, register, me } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.get('/me', authenticate, me);

module.exports = router;
