import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import monitoringRoutes from './routes/monitoringRoutes.js';

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/', (_, res) => res.json({ message: 'AI Exam Monitoring API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/monitoring', monitoringRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch(err => console.error('MongoDB connection failed:', err.message));
