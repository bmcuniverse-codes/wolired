import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as blazeface from "@tensorflow-models/blazeface";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import api from "../services/api";

const ALERT_GAP = 8000;

export default function ExamRoom() {
  const { id } = useParams();
  const nav = useNavigate();

  const videoRef = useRef(null);
  const lastAlert = useRef({});
  const started = useRef(new Date());
  const streamRef = useRef(null);

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [models, setModels] = useState({ face: null, obj: null });
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExam() {
      try {
        const res = await api.get(`/exams/${id}`);
        setExam(res.data);
        setTimeLeft(Number(res.data.duration || 30) * 60);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load exam.");
      }
    }

    loadExam();
  }, [id]);

  useEffect(() => {
    async function loadModels() {
      try {
        const [face, obj] = await Promise.all([
          blazeface.load(),
          cocoSsd.load(),
        ]);

        setModels({ face, obj });
        setModelsReady(true);
      } catch (err) {
        setError("AI models failed to load. Check your internet connection.");
      }
    }

    loadModels();
  }, []);

  useEffect(() => {
    if (!exam) return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = async () => {
            await videoRef.current.play();
            setCameraReady(true);
          };
        }
      } catch (err) {
        setError("Camera permission is required for this exam.");
      }
    }

    startCamera();

    return () => {
      streamRef.current?.getTracks()?.forEach((track) => track.stop());
    };
  }, [exam]);

  useEffect(() => {
    if (!timeLeft) return;

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          submit();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const logAlert = async (type, message, confidence = 0) => {
    const now = Date.now();

    if (lastAlert.current[type] && now - lastAlert.current[type] < ALERT_GAP) {
      return;
    }

    lastAlert.current[type] = now;

    const item = {
      type,
      message,
      confidence,
      timestamp: new Date().toISOString(),
    };

    setAlerts((current) => [item, ...current].slice(0, 12));

    try {
      await api.post("/monitoring/log", {
        exam: id,
        type,
        message,
        confidence,
        examTimeSeconds: Math.floor((new Date() - started.current) / 1000),
      });
    } catch (err) {
      console.log("Unable to save monitoring log", err.message);
    }
  };

  useEffect(() => {
    if (!models.face || !models.obj || !cameraReady) return;

    const interval = setInterval(async () => {
      const video = videoRef.current;

      if (!video || video.readyState < 2 || !video.videoWidth) return;

      try {
        const faces = await models.face.estimateFaces(video, false);

        if (faces.length === 0) {
          logAlert("NO_FACE", "No face detected in camera");
        }

        if (faces.length > 1) {
          logAlert("MULTIPLE_FACES", "Multiple faces detected");
        }

        if (faces.length === 1) {
          const [x1] = faces[0].topLeft;
          const [x2] = faces[0].bottomRight;

          const center = (x1 + x2) / 2;
          const ratio = center / video.videoWidth;

          if (ratio < 0.3 || ratio > 0.7) {
            logAlert(
              "LOOKING_AWAY",
              "Student appears to be looking away repeatedly"
            );
          }
        }

        const objects = await models.obj.detect(video);
        const phone = objects.find(
          (item) => item.class === "cell phone" && item.score > 0.45
        );

        if (phone) {
          logAlert("PHONE_DETECTED", "Possible mobile phone detected", phone.score);
        }
      } catch (err) {
        console.log("AI detection error", err.message);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [models, cameraReady]);

  async function submit() {
    if (!exam) return;

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
      })
    );

    await api.post(`/exams/${id}/submit`, {
      answers: formattedAnswers,
      startedAt: started.current,
    });

    nav("/student");
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <div className="card border border-red-500/40 bg-red-500/10">
          <h1 className="text-2xl font-black text-red-200">Exam Room Error</h1>
          <p className="mt-3 text-slate-200">{error}</p>
          <button onClick={() => nav("/student")} className="btn mt-5">
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!exam) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="card text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent"></div>
          <h1 className="text-xl font-black">Loading exam room...</h1>
          <p className="mt-2 text-sm text-slate-400">
            Preparing test questions and AI monitoring.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 overflow-hidden p-3 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="card min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">{exam.title}</h1>
            <p className="text-slate-400">{exam.description}</p>
          </div>

          <span className="badge bg-cyan-400/20 text-cyan-200">
            {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </span>
        </div>

        {exam.questions?.length ? (
          exam.questions.map((q, index) => (
            <div className="mb-5 rounded-2xl bg-slate-950/50 p-4" key={q._id}>
              <h3 className="mb-3 font-bold">
                {index + 1}. {q.question}
              </h3>

              <div className="grid gap-2">
                {q.options
                  ?.filter(Boolean)
                  .map((option) => (
                    <label
                      className="cursor-pointer rounded-xl bg-white/5 p-3 transition hover:bg-white/10"
                      key={option}
                    >
                      <input
                        name={q._id}
                        className="mr-2"
                        type="radio"
                        checked={answers[q._id] === option}
                        onChange={() =>
                          setAnswers({ ...answers, [q._id]: option })
                        }
                      />
                      {option}
                    </label>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-yellow-500/10 p-4 text-yellow-100">
            No questions were added to this exam.
          </div>
        )}

        <button onClick={submit} className="btn w-full">
          Submit Exam
        </button>
      </section>

      <aside className="min-w-0 space-y-4 lg:space-y-5">
        <div className="card">
          <h2 className="mb-3 font-bold">Live AI Monitor</h2>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full rounded-2xl bg-black object-cover"
          />

          <div className="mt-3 grid gap-2 text-xs text-slate-400">
            <p>
              Camera:{" "}
              <span className={cameraReady ? "text-green-300" : "text-yellow-300"}>
                {cameraReady ? "Active" : "Starting..."}
              </span>
            </p>

            <p>
              AI Models:{" "}
              <span className={modelsReady ? "text-green-300" : "text-yellow-300"}>
                {modelsReady ? "Loaded" : "Loading..."}
              </span>
            </p>

            <p>AI checks: no face, multiple faces, looking away, phone detection.</p>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-3 font-bold">Live Alerts</h2>

          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="rounded-xl bg-red-500/20 p-3 text-sm">
                <b>{alert.type}</b>
                <p>{alert.message}</p>
              </div>
            ))}

            {!alerts.length && (
              <p className="text-sm text-slate-400">
                No suspicious activity detected yet.
              </p>
            )}
          </div>
        </div>
      </aside>
    </main>
  );
}