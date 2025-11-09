import React, { useEffect, useRef, useState } from "react";
import LoadingScreen from "./components/LoadingScreen.jsx";
import StartScreen from "./components/StartScreen.jsx";
import QuizView from "./components/QuizView.jsx";
import ResultPopup from "./components/ResultPopup.jsx";
import AdminPanel from "./components/AdminPanel.jsx"; // pastikan ini ada
import questions from "./data/questions.js";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(null);
  const [finished, setFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const clickRef = useRef(null);
  const correctRef = useRef(null);
  const wrongRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1400);
    clickRef.current = new Audio("/sounds/click.mp3");
    correctRef.current = new Audio("/sounds/correct.mp3");
    wrongRef.current = new Audio("/sounds/wrong.mp3");
    bgRef.current = new Audio("/sounds/bg.mp3");
    if (bgRef.current) {
      bgRef.current.loop = true;
      bgRef.current.volume = 0.18;
    }
  }, []);

  useEffect(() => {
    if (started && soundEnabled) {
      bgRef.current?.play().catch(() => {});
    } else {
      bgRef.current?.pause();
      if (bgRef.current) bgRef.current.currentTime = 0;
    }
  }, [started, soundEnabled]);

  const startGame = () => {
    setStarted(true);
    if (soundEnabled) clickRef.current?.play();
  };

  const finishLevel = (finalScore) => {
    setScore(finalScore);
    setFinished(true);
    try {
      const entry = {
        name: localStorage.getItem("quiz_user_name") || "",
        origin: localStorage.getItem("quiz_user_origin") || "",
        phone: localStorage.getItem("quiz_user_phone") || "",
        score: finalScore,
        level,
        timestamp: new Date().toISOString(),
      };
      const arr = JSON.parse(localStorage.getItem("quiz_submissions") || "[]");
      arr.push(entry);
      localStorage.setItem("quiz_submissions", JSON.stringify(arr));
      fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }).catch(() => {});
    } catch (e) {
      console.error("save error", e);
    }
    bgRef.current?.pause();
  };

  const nextLevel = () => {
    setLevel((l) => Math.min(3, l + 1));
    setFinished(false);
    setScore(null);
    if (soundEnabled) clickRef.current?.play();
    setTimeout(() => {
      if (soundEnabled) bgRef.current?.play().catch(() => {});
    }, 200);
  };

  const restart = () => {
    setLevel(1);
    setFinished(false);
    setScore(null);
    setStarted(false);
    if (soundEnabled) clickRef.current?.play();
    bgRef.current?.pause();
    if (bgRef.current) bgRef.current.currentTime = 0;
  };

  const playCorrect = () => {
    if (soundEnabled) correctRef.current?.play();
  };
  const playWrong = () => {
    if (soundEnabled) wrongRef.current?.play();
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-gradient-to-b from-[#061428] via-[#0b1b2b] to-[#0b1220]">
        <div className="absolute inset-0 bg-animate opacity-30"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>

        <div className="relative z-10 w-full max-w-md p-6 rounded-2xl neon-border glass shadow-neon">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neonPurple to-neonBlue flex items-center justify-center neon-text font-bold">
                MQ
              </div>
              <div>
                <div className="text-sm text-slate-200">Quiz Muhammadiyah</div>
                <div className="text-xs text-slate-400">
                  Level {level} • {started ? "Playing" : "Ready"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSoundEnabled((s) => !s);
                  if (!soundEnabled) {
                    bgRef.current?.play().catch(() => {});
                  } else {
                    bgRef.current?.pause();
                  }
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  soundEnabled ? "bg-indigo-600" : "bg-gray-600"
                } text-white`}
              >
                {soundEnabled ? "Sound On" : "Sound Off"}
              </button>
            </div>
          </div>

          <div className="min-h-[420px] flex flex-col justify-center items-center">
            {loading && <LoadingScreen />}

            {!loading && !started && <StartScreen start={startGame} />}

            {!loading && started && !finished && (
              <QuizView
                questions={questions[`level${level}`]}
                onFinish={(s) => finishLevel(s)}
                onCorrect={playCorrect}
                onWrong={playWrong}
              />
            )}

            {finished && (
              <ResultPopup
                score={score}
                level={level}
                next={nextLevel}
                restart={restart}
              />
            )}
          </div>

          <div className="fixed right-4 bottom-4 z-50">
            <button
              onClick={() => setAdminOpen(true)}
              className="px-3 py-2 rounded-full bg-slate-900/80 border border-slate-700 text-sm text-white shadow-lg"
            >
              Admin
            </button>
          </div>

          <div className="mt-6">
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-neonBlue to-neonPink transition-all"
                style={{ width: `${(level / 3) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400 text-right">
            Progress: {level}/3
          </div>
        </div>
      </div>

      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}
