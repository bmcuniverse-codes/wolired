import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { name, email, password, role, matricNo } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, role: role || 'student', matricNo });
  res.status(201).json({ token: sign(user._id), user: { id: user._id, name, email, role: user.role, matricNo } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: sign(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role, matricNo: user.matricNo } });
});

router.get('/me', protect, (req, res) => res.json(req.user));
router.get('/students', protect, adminOnly, async (_, res) => res.json(await User.find({ role: 'student' }).select('-password')));
export default router;
