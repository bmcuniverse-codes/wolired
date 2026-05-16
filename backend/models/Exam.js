import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String, default: '' }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: Number, required: true },
  questions: [questionSchema],
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'published' }
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);
