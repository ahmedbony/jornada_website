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
  // User-assembled packet: array of { type: "option"|"resource", id, title, icon }
  const [packetItems, setPacketItems] = useState([]);

  function clearAnswers() {
    setAnswers(EMPTY_ANSWERS);
    setHasGenerated(false);
  }

  function addToPacket(item) {
    setPacketItems((prev) =>
      prev.find((p) => p.id === item.id) ? prev : [...prev, item]
    );
  }

  function removeFromPacket(id) {
    setPacketItems((prev) => prev.filter((p) => p.id !== id));
  }

  function isInPacket(id) {
    return packetItems.some((p) => p.id === id);
  }

  return (
    <PacketContext.Provider
      value={{
        answers, setAnswers, hasGenerated, setHasGenerated, clearAnswers,
        packetItems, addToPacket, removeFromPacket, isInPacket,
      }}
    >
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
