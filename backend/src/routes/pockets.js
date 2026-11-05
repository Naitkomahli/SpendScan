const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getAll,
  create,
  update,
  remove,
  setEnabled,
} = require('../controllers/pocketController');

const router = Router();

router.use(authenticate);

router.get('/', getAll);
router.post('/', create);
router.patch('/settings', setEnabled); // harus di atas '/:id'
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
