import express from 'express';
import MalpracticeLog from '../models/MalpracticeLog.js';
import { protect, adminOnly } from '../middleware/auth.js';
const router = express.Router();

router.post('/log', protect, async (req, res) => {
  const log = await MalpracticeLog.create({ ...req.body, student: req.user._id });
  res.status(201).json(log);
});

router.get('/logs', protect, adminOnly, async (req, res) => {
  const query = {};
  if (req.query.exam) query.exam = req.query.exam;
  if (req.query.student) query.student = req.query.student;
  const logs = await MalpracticeLog.find(query).populate('exam', 'title').populate('student', 'name email matricNo').sort({ timestamp: -1 });
  res.json(logs);
});

router.get('/my-logs/:examId', protect, async (req, res) => {
  const logs = await MalpracticeLog.find({ exam: req.params.examId, student: req.user._id }).sort({ timestamp: -1 });
  res.json(logs);
});
export default router;
