'use client';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);

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
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);



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

  if (riddles.length === 0) return <div>Loading...</div>;
  if (current >= riddles.length) return <div>クリア！</div>;

  // タイマー表示用関数
  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.timer}>{formatTime(timer)}</div>
      <div className={styles.container}>
        <p className={styles.question_number}>問{riddles[current].id}</p>
        <div className={styles.img}>
          <Image
            src={riddles[current].image}
            alt={`riddle${riddles[current].id}`}
            width={980}
            height={700}
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