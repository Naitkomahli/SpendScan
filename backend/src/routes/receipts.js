const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { scanFromBase64 } = require('../controllers/receiptController');

const router = Router();

router.use(authenticate);

router.post('/scan', scanFromBase64);

module.exports = router;
