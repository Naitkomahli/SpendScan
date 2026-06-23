const { Router } = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { scanReceipt, uploadAndScan } = require('../controllers/receiptController');

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

router.use(authenticate);

router.post('/scan', upload.single('receipt'), uploadAndScan);

module.exports = router;
