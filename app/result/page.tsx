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

    const postedRef = useRef(false);

    useEffect(() => {
        setTeamValue(team || (typeof window !== "undefined" ? window.localStorage.getItem("name") || "" : ""));
        setModeValue(typeof window !== "undefined" ? window.localStorage.getItem("mode") || "normal" : "normal");
    }, [team]);

    // resultページ初回表示時にSupabaseへPOST（値取得後）
    useEffect(() => {
        if (!teamValue || !modeValue || postedRef.current) return;
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

        </div>
    );
}