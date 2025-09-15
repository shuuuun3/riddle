'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [selected, setSelected] = useState("solo");
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const handleSelect = (value: "solo" | "tag") => {
    setSelected(value);
  };

  const handleStart = () => {
    if (!inputValue.trim()) {
      alert("チーム名を入力してください");
      return;
    }
    localStorage.setItem("mode", selected);
    localStorage.setItem("name", inputValue);
    router.push("/riddles");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <p>2025年度</p>
        <p>高槻りどる高校入学試験問題</p>
        <p>一般</p>
        <h1 className={styles.title}>タイムアタック謎解き</h1>
        <div className={styles.selector}>
          <div
            className={
              selected === "solo"
                ? `${styles.content} ${styles.selected}`
                : styles.content
            }
            onClick={() => handleSelect("solo")}
            style={{ cursor: "pointer" }}
          >
            ソロ
          </div>
          <div
            className={
              selected === "tag"
                ? `${styles.content} ${styles.selected}`
                : styles.content
            }
            onClick={() => handleSelect("tag")}
            style={{ cursor: "pointer" }}
          >
            タッグ
          </div>
        </div>

        <div className={styles.input_area}>
          <input
            type="text"
            placeholder="チーム名を入力してください"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ paddingLeft: "1rem" }}
          />
        </div>

        <div className={styles.start_button} onClick={() => {handleStart()}}>
          スタート
        </div>
      </div>
    </div>
  );
}
