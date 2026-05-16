import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ questionId: String, answer: String }],
  startedAt: Date,
  submittedAt: Date,
  score: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
