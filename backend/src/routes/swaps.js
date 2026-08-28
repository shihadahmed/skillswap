const router = require('express').Router();
const auth = require('../middleware/auth');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// POST /api/swaps -> create a swap request
router.post('/', auth, async (req, res) => {
  try {
    const { to, skillOffered, skillRequested, message } = req.body;
    if (!to || !skillOffered || !skillRequested)
      return res.status(400).json({ message: 'to, skillOffered and skillRequested are required' });
    if (to === req.userId)
      return res.status(400).json({ message: 'Cannot swap with yourself' });

    const target = await User.findById(to);
    if (!target) return res.status(404).json({ message: 'Target user not found' });

    const swap = await SwapRequest.create({
      from: req.userId,
      to,
      skillOffered,
      skillRequested,
      message: message || '',
    });
    res.status(201).json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/swaps -> requests involving current user
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.query; // 'sent' | 'received' | undefined=all
    const filter = {};
    if (role === 'sent') filter.from = req.userId;
    else if (role === 'received') filter.to = req.userId;
    else filter.$or = [{ from: req.userId }, { to: req.userId }];

    const swaps = await SwapRequest.find(filter)
      .populate('from', 'name avatar location')
      .populate('to', 'name avatar location')
      .sort({ createdAt: -1 });
    res.json(swaps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/swaps/:id -> update status (accept/decline/complete)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined', 'completed', 'pending'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });

    // only the recipient can accept/decline; only participants can complete
    if ((status === 'accepted' || status === 'declined') && String(swap.to) !== req.userId)
      return res.status(403).json({ message: 'Only the recipient can update this request' });

    swap.status = status;
    await swap.save();

    if (status === 'completed') {
      await Promise.all([
        User.findByIdAndUpdate(swap.from, { $inc: { swapsCompleted: 1 } }),
        User.findByIdAndUpdate(swap.to, { $inc: { swapsCompleted: 1 } }),
      ]);
    }
    res.json(swap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/swaps/:id -> cancel a request
router.delete('/:id', auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap request not found' });
    if (String(swap.from) !== req.userId && String(swap.to) !== req.userId)
      return res.status(403).json({ message: 'Not authorized' });

    await swap.deleteOne();
    res.json({ message: 'Swap request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
