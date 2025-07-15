
import React, { useState } from "react";
import './App.css';

export default function App() {
  const [selectedTag, setSelectedTag] = useState("");
  const [tags, setTags] = useState({});
  const [animateChips, setAnimateChips] = useState(false);

  const handId = 1; // This would be dynamic based on hand selection

  const handleTag = (tag) => {
    setTags({ ...tags, [handId]: tag });
    setSelectedTag(tag);
  };

  const handleExport = (format) => {
    const data = JSON.stringify(tags, null, 2);
    const blob = new Blob([data], { type: format === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hand-tags.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerChipAnimation = () => {
    setAnimateChips(true);
    setTimeout(() => setAnimateChips(false), 1500);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto sm:p-6">
      <h1 className="text-xl font-bold mb-4 text-center">ICMIZER Hand Replayer</h1>
      <div className="flex flex-col sm:flex-row sm:gap-4 mb-4 space-y-2 sm:space-y-0">
        <button onClick={() => handleTag("good")} className="px-4 py-2 bg-green-500 text-white rounded w-full sm:w-auto">✅ Good Play</button>
        <button onClick={() => handleTag("mistake")} className="px-4 py-2 bg-red-500 text-white rounded w-full sm:w-auto">❌ Mistake</button>
        <button onClick={() => handleTag("review")} className="px-4 py-2 bg-yellow-500 text-white rounded w-full sm:w-auto">📌 Review Later</button>
      </div>
      {selectedTag && <p className="text-sm mb-4 text-center">Tag for Hand #{handId}: <strong>{selectedTag}</strong></p>}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button onClick={() => handleExport("json")} className="px-4 py-2 bg-blue-500 text-white rounded w-full sm:w-auto">📤 Export JSON</button>
        <button onClick={() => handleExport("txt")} className="px-4 py-2 bg-gray-700 text-white rounded w-full sm:w-auto">📝 Export TXT</button>
      </div>
      <div className="mt-8">
        <button onClick={triggerChipAnimation} className="px-4 py-2 bg-purple-600 text-white rounded w-full sm:w-auto">💸 Showdown (Animate Chips)</button>
        <div className={`mt-6 h-10 w-full relative overflow-hidden`}>
          <div className={`chip-animation ${animateChips ? 'animate-move' : ''}`}>💰</div>
        </div>
      </div>
    </div>
  );
}
