"use client";

import styles from './page.module.css'
import { useGameContext } from "../GameContext";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

export default function Result() {
    const { timer, team, reset } = useGameContext();
    const router = useRouter();

    // SSR/CSRの値不一致を防ぐため初期値は空文字列
    const [teamValue, setTeamValue] = useState("");
    const [modeValue, setModeValue] = useState("");
    const [rank, setRank] = useState<number | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [solved, setSolved] = useState<string>("");

    const postedRef = useRef(false);

    useEffect(() => {
        setTeamValue(team || (typeof window !== "undefined" ? window.localStorage.getItem("name") || "" : ""));
        setModeValue(typeof window !== "undefined" ? window.localStorage.getItem("mode") || "normal" : "normal");
        setSolved(typeof window !== "undefined" ? window.localStorage.getItem("solved") || "" : "");
        setTotal(15);
    }, [team]);

    // 15分強制終了判定
    const isTimeout = typeof window !== "undefined" && window.localStorage.getItem("timeout") === "1";

    // resultページ初回表示時にSupabaseへPOST（値取得後）
    useEffect(() => {
        const isTimeout = typeof window !== "undefined" && window.localStorage.getItem("timeout") === "1";
        if (!teamValue || !modeValue || postedRef.current || isTimeout) return;
        postedRef.current = true; // 一度だけPOST
        const postResult = async () => {
            await supabase.from("riddle_ta_result").insert({
                name: teamValue,
                time: timer, // 秒数のintで保存
                mode: modeValue,
                created_at: new Date().toISOString()
            });
        };
        postResult();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamValue, modeValue, timer]);

    // 順位と母数を取得
    useEffect(() => {
        async function fetchRank() {
            if (!teamValue || !modeValue) return;
            const { data, error } = await supabase
                .from("riddle_ta_result")
                .select("name, time")
                .eq("mode", modeValue)
                .order("time", { ascending: true });
            if (!error && data) {
                if (data.length === 0) {
                    setRank(1);
                    setTotal(1);
                    return;
                }
                setTotal(data.length);
                const sorted = data.sort((a, b) => a.time - b.time);
                const idx = sorted.findIndex(
                    (row) => row.name === teamValue && row.time === timer
                );
                setRank(idx >= 0 ? idx + 1 : null);
            }
        }
        fetchRank();
    }, [teamValue, modeValue, timer]);

    function formatTime(sec: number) {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    const handleReset = () => {
        reset();
        router.push("/");
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.reset} onClick={handleReset}>
                next
            </div>
            <div className={styles.container}>
                <div className={styles.name}>
                    <p>NAME</p>
                    <h2>{teamValue}</h2>
                </div>
                <div className={styles.detail}>
                    <div className={styles.title}>
                        <h1 className={styles.mode}
                            style={
                                modeValue === "solo"
                                    ? { color: "#ff5757" }
                                    : modeValue === "tag"
                                    ? { color: "#50b0ff" }
                                    : { color: "white" }
                            }
                        >{modeValue === "solo" ? "ソロ" : modeValue === "tag" ? "タッグ" : modeValue}<span className={styles.department}> 部門</span></h1>
                        <div>
                            <h2>タイムアタック謎解き</h2>
                            <p><span>■</span> RESULT</p>
                        </div>
                    </div>
                    <div className={styles.result}>
                        <div className={styles.content}>
                            <h2>SCORE</h2>
                            <div className={styles.line}></div>
                            <p>
                                {/* 15分強制終了なら正解数のみ、15分以内完答ならタイマーのみ、それ以外は正解数のみ */}
                                {isTimeout
                                    ? `${solved}/15`
                                    : (Number(solved) === 15 ? formatTime(timer) : `${solved}/15`)}
                            </p>
                        </div>
                        <div className={styles.content}>
                            <h2>RANK</h2>
                            <div className={styles.line}></div>
                            <p>{isTimeout ? "--" : (rank !== null && total !== null ? `${rank}` : "--")}<span className={styles.totalNumber}>{isTimeout ? "" : (rank !== null && total !== null ? `/${total}` : "")}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}