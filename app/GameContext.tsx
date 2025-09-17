"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface GameResult {
  timer: number;
  team: string;
  department: string;
}

interface GameContextType extends GameResult {
  setTimer: (timer: number) => void;
  setTeam: (team: string) => void;
  setDepartment: (department: string) => void;
  reset: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGameContext must be used within GameProvider");
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [timer, setTimer] = useState(0);
  const [team, setTeam] = useState("");
  const [department, setDepartment] = useState("");

  const reset = () => {
    setTimer(0);
    setTeam("");
    setDepartment("");
  };

  return (
    <GameContext.Provider value={{ timer, team, department, setTimer, setTeam, setDepartment, reset }}>
      {children}
    </GameContext.Provider>
  );
};
