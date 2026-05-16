import express from "express";
import Exam from "../models/Exam.js";
import Submission from "../models/Submission.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: "Unable to create exam" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? {}
        : { assignedTo: req.user._id, status: "published" };

    const exams = await Exam.find(query)
      .populate("assignedTo", "name email matricNo")
      .sort({ createdAt: -1 });

    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch exams" });
  }
});

/* IMPORTANT: This must come before /:id */
router.get("/reports/all", protect, adminOnly, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("exam", "title duration")
      .populate("student", "name email matricNo")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch reports" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate(
      "assignedTo",
      "name email matricNo"
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (req.user.role !== "admin") {
      const isAssigned = exam.assignedTo.some((student) => {
        const studentId = student._id ? student._id.toString() : student.toString();
        return studentId === req.user._id.toString();
      });

      if (!isAssigned) {
        return res.status(403).json({ message: "Not assigned to this exam" });
      }
    }

    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Unable to load exam" });
  }
});

router.patch("/:id/assign", protect, adminOnly, async (req, res) => {
  try {
    const { studentIds } = req.body;

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { assignedTo: studentIds || [], status: "published" },
      { new: true }
    ).populate("assignedTo", "name email matricNo");

    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Unable to assign exam" });
  }
});

router.post("/:id/submit", protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const submission = await Submission.create({
      exam: exam._id,
      student: req.user._id,
      answers: req.body.answers || [],
      startedAt: req.body.startedAt,
      submittedAt: new Date(),
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: "Unable to submit exam" });
  }
});

export default router;