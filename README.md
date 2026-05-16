# AI Exam Monitoring System

A lightweight full-stack AI-powered exam monitoring MVP with admin/student roles, exam assignment, webcam monitoring, browser-based computer vision detection, malpractice logs, submissions, and reports.

## Stack
- Frontend: React, Vite, Tailwind CSS, TensorFlow.js, BlazeFace, COCO-SSD
- Backend: Node.js, Express, MongoDB, JWT

## MVP Detections
- No face detected
- Multiple faces detected
- Looking away repeatedly
- Phone detected

## How to run

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Default frontend URL: `http://localhost:5173`
Default backend URL: `http://localhost:5000`

## Create first admin
Register using role `Admin` on the register page.

## Notes
- Camera access requires browser permission.
- Phone detection depends on the COCO-SSD model confidence and lighting.
- Looking-away detection is estimated using face box position, so it is suitable for MVP/demo use.
