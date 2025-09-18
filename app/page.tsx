'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";


function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return (
    <>
      {m}
      <span className={styles.timeUnit}>分</span>
      {s}
      <span className={styles.timeUnit}>秒</span>
    </>
  );
}

export default function Home() {
  const [selected, setSelected] = useState("solo");
  const [inputValue, setInputValue] = useState("");
  const [ranking, setRanking] = useState<{ name: string; time: number }[]>([]);
  const [tagRanking, setTagRanking] = useState<{ name: string; time: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchRanking() {
      const { data, error } = await supabase
        .from("riddle_ta_result")
        .select("name, time")
        .eq("mode", "solo")
        .order("time", { ascending: true })
        .limit(3);
      if (!error && data) {
        setRanking(data);
      }
    }
    async function fetchTagRanking() {
      const { data, error } = await supabase
        .from("riddle_ta_result")
        .select("name, time")
        .eq("mode", "tag")
        .order("time", { ascending: true })
        .limit(3);
      if (!error && data) {
        setTagRanking(data);
      }
    }
    fetchRanking();
    fetchTagRanking();
  }, []);

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

      <div className={styles.testButton} onClick={() => router.push("/riddles_test")}>お試し</div>

      <div className={styles.ranking}>
        <h1>ソロ部門</h1>
        <div className={styles.ranking_container}>
          {ranking.map((person, i) => (
            <div className={styles.person} key={i}>
              <div className={styles.profile}>
                <Image src="/crown.svg" alt="Crown" width={50} height={50} className={styles[`crown${i+1}`]} />
                <p>{person.name}</p>
              </div>
              <p className={styles.time}>{formatTime(person.time)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.container}>
        <p>2025年度</p>
        <p>高槻りどる高校入学試験問題</p>
        <p>一般</p>
        <h1 className={styles.title}>タイムアタック謎解き</h1>
        <h2>※回答はすべて<span>ひらがな</span>で入力してください。<br/>
        　Enter(エンター)を押さないと次の問題に進みません。</h2>
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
            placeholder="チーム名を入力（8文字以内）"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ paddingLeft: "1rem" }}
            maxLength={8}
          />
        </div>

        <div className={styles.start_button} onClick={() => {handleStart()}}>
          スタート
        </div>
      </div>

      <div className={styles.ranking}>
        <h1>タッグ部門</h1>
        <div className={styles.ranking_container}>
          {tagRanking.map((person, i) => (
            <div className={styles.person} key={i}>
              <div className={styles.profile}>
                <Image src="/crown.svg" alt="Crown" width={50} height={50} className={styles[`crown${i+1}`]} />
                <p>{person.name}</p>
              </div>
              <p className={styles.time}>{formatTime(person.time)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
