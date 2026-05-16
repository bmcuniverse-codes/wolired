import mongoose from 'mongoose';

const malpracticeLogSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  confidence: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  examTimeSeconds: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('MalpracticeLog', malpracticeLogSchema);
