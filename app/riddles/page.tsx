'use client';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useGameContext } from "../GameContext";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Riddle = {
  id: number;
  answer: string;
  image: string;
};

// ひらがなに変換する関数
function toHiragana(str: string) {
  return str
    .replace(/[ァ-ン]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60))
    .normalize("NFKC");
}

export default function Riddles() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [riddles, setRiddles] = useState<Riddle[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [team, setTeam] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("name") || "" : ""));
  const [department, setDepartment] = useState("");
  const [mode, setMode] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem("mode") || "solo" : "solo"));
  const { setTimer, setTeam: setTeamCtx, setDepartment: setDepartmentCtx, timer } = useGameContext();
  const [localTimer, setLocalTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetch("/data/riddle.json")
      .then(res => res.json())
      .then(data => setRiddles(data));
  setIsActive(true); // ページ表示時にタイマー開始
    // F5やCtrl+Rなどのリロードをブロック
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5" || (e.ctrlKey && e.key.toLowerCase() === "r")) {
        e.preventDefault();
        e.stopPropagation();
        // アラートを出さずに何もしない
        return false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // ブラウザのリロード・ページ離脱をブロック
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "ページを離れますか？";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // タイマー処理
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isActive) {
      interval = setInterval(() => {
        setLocalTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // localTimerが変化したらContextにも反映
  useEffect(() => {
    setTimer(localTimer);
  }, [localTimer, setTimer]);



  // ページ初回表示時と問題切り替え時にinputをアクティブ＆中身クリア
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setInput("");
  }, [current]);

  useEffect(() => {
    // ページ初回表示時にもinputをアクティブ（遅延で確実にフォーカス）
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  // currentがriddles.lengthになったらuseEffectで遷移・値保存
  useEffect(() => {
    if (riddles.length > 0 && current >= riddles.length) {
      if (typeof window !== "undefined") {
        // teamやmodeが空欄の場合はlocalStorageの値を維持
        if (team) window.localStorage.setItem("name", team);
        if (mode) window.localStorage.setItem("mode", mode);
      }
      router.push("/result");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, riddles.length]);

  // すべてのHooksの後で条件分岐return
  if (riddles.length === 0) return <div>Loading...</div>;
  if (current >= riddles.length) return null;

  // タイマー表示用関数
  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className={styles.wrapper}>
      {/* デバッグ用: 全問正解ボタン（不要になったら削除） */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "32px 0 16px 0" }}>
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              if (team) window.localStorage.setItem("name", team);
              if (mode) window.localStorage.setItem("mode", mode);
            }
            setCurrent(riddles.length);
          }}
          style={{
            fontSize: "1.5rem",
            padding: "16px 32px",
            background: "#ff5252",
            zIndex: 10,
          }}
        >
          デバッグ: 全問正解
        </button>
      </div>
      <div className={styles.timer}>{formatTime(localTimer)}</div>
      <div className={styles.container}>
        <div className={styles.input_group}>
          <input
            type="text"
            value={team}
            onChange={e => setTeam(e.target.value)}
            placeholder="チーム名"
          />
          <input
            type="text"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            placeholder="部門名"
          />
        </div>
        <p className={styles.question_number}>問{riddles[current].id}</p>
        <div className={styles.img}>
          <Image
            src={riddles[current].image}
            alt={`riddle${riddles[current].id}`}
            width={875}
            height={625}
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (
              e.key === "Enter" &&
              input.trim() !== "" &&
              toHiragana(input.trim()) === toHiragana(riddles[current]?.answer.trim())
            ) {
              setCurrent(prev => prev + 1);
              setInput("");
            }
          }}
          placeholder="答えを入力"
        />
      </div>
    </div>
  );
}