import { createContext, useContext, useState } from "react";

const PacketContext = createContext(null);

const EMPTY_ANSWERS = {
  context: [],
  waterStress: [],
  waterOutcome: [],
  priorities: [],
  notes: "",
};

export function PacketProvider({ children }) {
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [hasGenerated, setHasGenerated] = useState(false);

  function clearAnswers() {
    setAnswers(EMPTY_ANSWERS);
    setHasGenerated(false);
  }

  return (
    <PacketContext.Provider value={{ answers, setAnswers, hasGenerated, setHasGenerated, clearAnswers }}>
      {children}
    </PacketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePacket() {
  const ctx = useContext(PacketContext);
  if (!ctx) throw new Error("usePacket must be used within a PacketProvider");
  return ctx;
}
