import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>タイムアタック謎解き</h1>
        <p className={styles.description}>
          制限時間内に謎を解いて、ゴールを目指そう！
        </p>
        <div className={styles.start_button}>スタート</div>
      </div>
    </div>
  );
}
