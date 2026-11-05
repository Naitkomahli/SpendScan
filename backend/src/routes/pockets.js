const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getAll, upsert } = require('../controllers/pocketController');

const router = Router();

router.use(authenticate);

router.get('/', getAll);
router.put('/', upsert);

module.exports = router;
