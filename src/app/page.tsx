"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { generateRandomParagraph } from "./commonWords";

// Keyboard layout definitions
const KEYBOARD_LAYOUTS = {
  qwerty: {
    name: "QWERTY",
    leftHand: new Set([
      "q",
      "w",
      "e",
      "r",
      "t",
      "a",
      "s",
      "d",
      "f",
      "g",
      "z",
      "x",
      "c",
      "v",
      "b",
      "1",
      "2",
      "3",
      "4",
      "5",
      "`",
      "~",
      "!",
      "@",
      "#",
      "$",
      "%",
    ]),
    rightHand: new Set([
      "y",
      "u",
      "i",
      "o",
      "p",
      "h",
      "j",
      "k",
      "l",
      "n",
      "m",
      "6",
      "7",
      "8",
      "9",
      "0",
      "^",
      "&",
      "*",
      "(",
      ")",
      "-",
      "_",
      "=",
      "+",
      "[",
      "]",
      "{",
      "}",
      ";",
      ":",
      "'",
      '"',
      ",",
      ".",
      "<",
      ">",
      "/",
      "?",
      "\\",
      "|",
    ]),
    baseline: { left: 56, right: 44 }, // Research averages
  },
  dvorak: {
    name: "Dvorak",
    leftHand: new Set([
      "'",
      '"',
      ",",
      "<",
      ".",
      ">",
      "p",
      "y",
      "a",
      "o",
      "e",
      "u",
      "i",
      ";",
      ":",
      "q",
      "j",
      "k",
      "x",
      "1",
      "2",
      "3",
      "4",
      "5",
      "`",
      "~",
      "!",
      "@",
      "#",
      "$",
      "%",
    ]),
    rightHand: new Set([
      "f",
      "g",
      "c",
      "r",
      "l",
      "d",
      "h",
      "t",
      "n",
      "s",
      "b",
      "m",
      "w",
      "v",
      "z",
      "6",
      "7",
      "8",
      "9",
      "0",
      "^",
      "&",
      "*",
      "(",
      ")",
      "-",
      "_",
      "=",
      "+",
      "[",
      "]",
      "{",
      "}",
      "/",
      "?",
      "\\",
      "|",
    ]),
    baseline: { left: 44, right: 56 }, // Research averages
  },
  colemak: {
    name: "Colemak",
    leftHand: new Set([
      "q",
      "w",
      "f",
      "p",
      "g",
      "a",
      "r",
      "s",
      "t",
      "d",
      "z",
      "x",
      "c",
      "v",
      "b",
      "1",
      "2",
      "3",
      "4",
      "5",
      "`",
      "~",
      "!",
      "@",
      "#",
      "$",
      "%",
    ]),
    rightHand: new Set([
      "j",
      "l",
      "u",
      "y",
      ";",
      ":",
      "h",
      "n",
      "e",
      "i",
      "o",
      "k",
      "m",
      "6",
      "7",
      "8",
      "9",
      "0",
      "^",
      "&",
      "*",
      "(",
      ")",
      "-",
      "_",
      "=",
      "+",
      "[",
      "]",
      "{",
      "}",
      "'",
      '"',
      ",",
      ".",
      "<",
      ">",
      "/",
      "?",
      "\\",
      "|",
    ]),
    baseline: { left: 48, right: 52 }, // Research averages
  },
};

type LayoutType = keyof typeof KEYBOARD_LAYOUTS;

const SAMPLE_TEXTS = {
  mixed: [
    "The quick brown fox jumps over the lazy dog. This pangram contains all letters of the alphabet.",
    "Practice makes perfect. The more you type, the faster and more accurate you will become.",
    "Technology has revolutionized the way we communicate and work in the modern world.",
    "Learning to type efficiently is a valuable skill that can save you time and increase productivity.",
  ],
  leftHand: [
    "We were eager to see the great red deer. The sweet treats were a great reward after a hard day.",
    "Fred ate bread and sweet treats. We saw deer and bears at the west gate. Great feats were rewarded.",
    "Ada gave Fred tea. Ted saw red deer. We ate sweet bread. Great bears rested at dusk.",
  ],
  rightHand: [
    "Only you know how you look. My mom took my book. Look up high in July sky.",
    "In July, Johnny took my only book. You know him. Look up, look out, join in.",
    "Phil took lily to pool. Johnny only knew him in July. Moon hung high up in inky sky.",
  ],
};

type TestMode = "mixed" | "leftHand" | "rightHand";

export default function Home() {
  const [layout, setLayout] = useState<LayoutType>("qwerty");
  const [testMode, setTestMode] = useState<TestMode>("mixed");
  const [text, setText] = useState(SAMPLE_TEXTS.mixed[0]);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leftHandStats, setLeftHandStats] = useState({ correct: 0, total: 0 });
  const [rightHandStats, setRightHandStats] = useState({
    correct: 0,
    total: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Get which hand types a character based on current layout
  const getHandForChar = (char: string): "left" | "right" | "space" => {
    const lowerChar = char.toLowerCase();
    if (char === " ") return "space";
    const currentLayout = KEYBOARD_LAYOUTS[layout];
    if (currentLayout.leftHand.has(lowerChar)) return "left";
    if (currentLayout.rightHand.has(lowerChar)) return "right";
    return "space"; // Default for unknown characters
  };

  // Calculate text distribution
  const calculateTextDistribution = () => {
    let leftCount = 0;
    let rightCount = 0;
    let spaceCount = 0;

    for (const char of text) {
      const hand = getHandForChar(char);
      if (hand === "left") leftCount++;
      else if (hand === "right") rightCount++;
      else spaceCount++;
    }

    const total = leftCount + rightCount;
    return {
      left: leftCount,
      right: rightCount,
      space: spaceCount,
      leftPercent: total > 0 ? Math.round((leftCount / total) * 100) : 0,
      rightPercent: total > 0 ? Math.round((rightCount / total) * 100) : 0,
    };
  };

  // Calculate WPM for specific hand
  const calculateHandWPM = (hand: "left" | "right") => {
    if (!startTime || !endTime) return 0;
    const timeInMinutes = (endTime - startTime) / 60000;
    const stats = hand === "left" ? leftHandStats : rightHandStats;
    // Approximate words by dividing characters by 5
    const words = stats.total / 5;
    return Math.round(words / timeInMinutes);
  };

  // Calculate overall WPM
  const calculateWPM = () => {
    if (!startTime || !endTime) return 0;
    const timeInMinutes = (endTime - startTime) / 60000;
    const wordsTyped = userInput.trim().split(" ").length;
    return Math.round(wordsTyped / timeInMinutes);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow correct characters
    if (value.length > userInput.length) {
      const newChar = value[value.length - 1];
      const expectedChar = text[userInput.length];

      // If character is incorrect, don't update
      if (newChar !== expectedChar) {
        return;
      }
    }

    // Start timer on first character
    if (!isStarted && value.length === 1) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    // Track hand statistics for new character
    if (value.length > userInput.length && value.length <= text.length) {
      const newCharIndex = value.length - 1;
      const targetChar = text[newCharIndex];
      const hand = getHandForChar(targetChar);

      if (hand === "left") {
        setLeftHandStats((prev) => ({
          correct: prev.correct + 1,
          total: prev.total + 1,
        }));
      } else if (hand === "right") {
        setRightHandStats((prev) => ({
          correct: prev.correct + 1,
          total: prev.total + 1,
        }));
      }
    }

    setUserInput(value);
    setCurrentIndex(value.length);

    // Check if finished
    if (value.length === text.length) {
      setIsFinished(true);
      setEndTime(Date.now());
    }
  };

  const reset = () => {
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setIsStarted(false);
    setIsFinished(false);
    setCurrentIndex(0);
    setLeftHandStats({ correct: 0, total: 0 });
    setRightHandStats({ correct: 0, total: 0 });
    inputRef.current?.focus();
  };

  const selectNewText = () => {
    if (testMode === "mixed" && isRandomMode) {
      setText(generateRandomParagraph(3));
    } else {
      const texts = SAMPLE_TEXTS[testMode];
      const randomIndex = Math.floor(Math.random() * texts.length);
      setText(texts[randomIndex]);
    }
    reset();
  };

  const changeMode = (mode: TestMode) => {
    setTestMode(mode);
    setIsRandomMode(false);
    const texts = SAMPLE_TEXTS[mode];
    setText(texts[0]);
    reset();
  };

  const toggleRandomMode = () => {
    if (testMode === "mixed") {
      setIsRandomMode(!isRandomMode);
      if (!isRandomMode) {
        setText(generateRandomParagraph(3));
      } else {
        setText(SAMPLE_TEXTS.mixed[0]);
      }
      reset();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "text-gray-500";
      const hand = getHandForChar(char);

      // Add subtle hand indication
      if (index >= userInput.length) {
        if (hand === "left") className += " border-b border-blue-900";
        else if (hand === "right") className += " border-b border-purple-900";
      }

      if (index < userInput.length) {
        className = "text-green-500";
      } else if (index === currentIndex) {
        className = "bg-white text-black";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const distribution = calculateTextDistribution();

  // Calculate hand balance feedback
  const calculateHandBalance = () => {
    // Research shows right hand is typically ~5% faster than left hand for right-handed typists
    const AVERAGE_SPEED_RATIO = 1.05; // Right hand / Left hand speed ratio for average person

    const leftWPM = calculateHandWPM("left");
    const rightWPM = calculateHandWPM("right");

    // Avoid division by zero
    if (leftWPM === 0 || rightWPM === 0) {
      return {
        statement: "Not enough data to compare hand speeds.",
        statementClass: "text-gray-400",
        details: "",
      };
    }

    // Calculate user's speed ratio
    const userRatio = rightWPM / leftWPM;
    const percentOfAverage = (userRatio / AVERAGE_SPEED_RATIO) * 100;

    let statement = "";
    let statementClass = "";
    let details = "";

    if (Math.abs(percentOfAverage - 100) < 10) {
      // Within 10% of average ratio
      statement = "Your hand speed balance is typical.";
      statementClass = "text-gray-300";
      details = `Your right hand is ${(userRatio * 100).toFixed(
        0
      )}% as fast as your left (average: ${(AVERAGE_SPEED_RATIO * 100).toFixed(
        0
      )}%)`;
    } else if (userRatio > AVERAGE_SPEED_RATIO) {
      // Right hand is disproportionately faster
      const howMuchFaster = (
        (userRatio / AVERAGE_SPEED_RATIO - 1) *
        100
      ).toFixed(0);
      statement = `Your right hand is disproportionately faster than average.`;
      statementClass = "text-purple-400";
      details = `Your right hand is ${(userRatio * 100).toFixed(
        0
      )}% as fast as your left (average: ${(AVERAGE_SPEED_RATIO * 100).toFixed(
        0
      )}%)`;
    } else {
      // Left hand is disproportionately faster
      const howMuchSlower = (
        (1 - userRatio / AVERAGE_SPEED_RATIO) *
        100
      ).toFixed(0);
      statement = `Your left hand is disproportionately faster than average.`;
      statementClass = "text-blue-400";
      details = `Your right hand is only ${(userRatio * 100).toFixed(
        0
      )}% as fast as your left (average: ${(AVERAGE_SPEED_RATIO * 100).toFixed(
        0
      )}%)`;
    }

    return { statement, statementClass, details };
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl mb-8 text-center text-white">
          typing_test.exe
        </h1>

        {/* Layout selector */}
        <div className="flex gap-2 justify-center mb-4 text-xs">
          {Object.entries(KEYBOARD_LAYOUTS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setLayout(key as LayoutType)}
              className={`px-3 py-1 border rounded transition-colors ${
                layout === key
                  ? "border-white text-black bg-white"
                  : "border-gray-700 hover:border-white hover:text-white"
              }`}
            >
              [{value.name}]
            </button>
          ))}
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 justify-center mb-4 text-sm">
          <button
            onClick={() => changeMode("mixed")}
            className={`px-4 py-2 border rounded transition-colors ${
              testMode === "mixed"
                ? "border-white text-black bg-white"
                : "border-gray-700 hover:border-white hover:text-white"
            }`}
          >
            [all]
          </button>
          <button
            onClick={() => changeMode("leftHand")}
            className={`px-4 py-2 border rounded transition-colors ${
              testMode === "leftHand"
                ? "border-blue-500 text-black bg-blue-500"
                : "border-gray-700 hover:border-blue-500 hover:text-blue-500"
            }`}
          >
            [left_hand]
          </button>
          <button
            onClick={() => changeMode("rightHand")}
            className={`px-4 py-2 border rounded transition-colors ${
              testMode === "rightHand"
                ? "border-purple-500 text-black bg-purple-500"
                : "border-gray-700 hover:border-purple-500 hover:text-purple-500"
            }`}
          >
            [right_hand]
          </button>
        </div>

        {/* Random mode toggle for mixed mode */}
        {testMode === "mixed" && (
          <div className="flex justify-center mb-8">
            <button
              onClick={toggleRandomMode}
              className={`px-4 py-2 border rounded transition-colors text-sm ${
                isRandomMode
                  ? "border-green-500 text-black bg-green-500"
                  : "border-gray-700 hover:border-green-500 hover:text-green-500"
              }`}
            >
              [random]
            </button>
          </div>
        )}

        {!isFinished ? (
          <>
            <div className="mb-12">
              <div className="text-lg leading-relaxed mb-4 select-none p-8 border border-gray-700 bg-black rounded text-center">
                {renderText()}
              </div>

              {/* Text distribution preview */}
              <div className="text-xs text-gray-600 text-center mb-4">
                text distribution:{" "}
                <span className="text-blue-400">
                  {distribution.leftPercent}% left
                </span>{" "}
                |{" "}
                <span className="text-purple-400">
                  {distribution.rightPercent}% right
                </span>
                {isRandomMode && (
                  <span className="text-green-400"> | random mode</span>
                )}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                className="w-full p-4 text-lg bg-black border border-gray-700 rounded text-white focus:border-white focus:outline-none font-mono text-center"
                placeholder="> start typing..."
                disabled={isFinished}
                spellCheck={false}
              />
            </div>

            <div className="flex justify-between items-center text-gray-400 text-sm">
              <div className="flex-1 text-center">
                {isStarted && !isFinished && (
                  <span className="text-white">
                    [{Math.floor((Date.now() - startTime!) / 1000)}s]
                  </span>
                )}
              </div>
              <button
                onClick={reset}
                className="px-4 py-2 border border-gray-700 hover:border-white hover:text-white transition-colors rounded"
              >
                [reset]
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-12 p-8 border border-gray-700 bg-black rounded">
              <h2 className="text-xl mb-8 text-white">// results</h2>

              {/* Overall stats */}
              <div className="text-4xl font-bold text-green-500 mb-2">
                {calculateWPM()} wpm
              </div>
              <div className="text-sm text-gray-400 mb-8">
                completed in {((endTime! - startTime!) / 1000).toFixed(1)}s
              </div>

              {/* Hand-specific stats */}
              <div className="border-t border-gray-800 pt-6 mt-6">
                <h3 className="text-sm text-gray-400 mb-4">
                  // hand performance [{KEYBOARD_LAYOUTS[layout].name}]
                </h3>
                <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto">
                  <div>
                    <div className="text-sm text-blue-400 mb-2">left hand</div>
                    <div className="text-2xl font-bold text-blue-500">
                      {calculateHandWPM("left")} wpm
                    </div>
                    <div className="text-sm text-gray-500">
                      {leftHandStats.total} chars ({distribution.leftPercent}%)
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-purple-400 mb-2">
                      right hand
                    </div>
                    <div className="text-2xl font-bold text-purple-500">
                      {calculateHandWPM("right")} wpm
                    </div>
                    <div className="text-sm text-gray-500">
                      {rightHandStats.total} chars ({distribution.rightPercent}
                      %)
                    </div>
                  </div>
                </div>

                {/* Hand balance analysis */}
                {testMode === "mixed" && (
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    {(() => {
                      const balance = calculateHandBalance();

                      return (
                        <>
                          {/* Direct comparison statement */}
                          <div
                            className={`text-lg font-bold mb-2 ${balance.statementClass}`}
                          >
                            {balance.statement}
                          </div>

                          {/* Details */}
                          <div className="text-sm text-gray-500 mb-4">
                            {balance.details}
                          </div>

                          {/* Visual speed comparison */}
                          <div className="grid grid-cols-2 gap-4 text-center mb-4">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">
                                your ratio
                              </div>
                              <div className="text-sm">
                                L:{" "}
                                <span className="text-blue-400">
                                  {calculateHandWPM("left")}
                                </span>{" "}
                                / R:{" "}
                                <span className="text-purple-400">
                                  {calculateHandWPM("right")}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">
                                typical ratio
                              </div>
                              <div className="text-sm text-gray-500">
                                right hand ~5% faster
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center text-sm mt-8">
                <button
                  onClick={reset}
                  className="px-4 py-2 border border-gray-700 hover:border-white hover:text-white transition-colors rounded"
                >
                  [retry]
                </button>
                <button
                  onClick={selectNewText}
                  className="px-4 py-2 border border-gray-700 hover:border-white hover:text-white transition-colors rounded"
                >
                  [new_text]
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-gray-500 text-xs mt-16 space-y-1">
          <p>// type the text as fast as you can</p>
          <p>// only correct characters allowed</p>
          {testMode === "mixed" && <p>// toggle [random] for generated text</p>}
        </div>
      </div>
    </div>
  );
}
