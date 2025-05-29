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

export default function Home() {
  const [layout, setLayout] = useState<LayoutType>("qwerty");
  const [text, setText] = useState("");
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
  const [charTimestamps, setCharTimestamps] = useState<number[]>([]);
  const [communityAverage, setCommunityAverage] = useState<number | null>(null);
  const [communityCount, setCommunityCount] = useState<number | null>(null);
  const [isLoadingAverage, setIsLoadingAverage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate initial text after mount to avoid hydration mismatch
  useEffect(() => {
    setText(generateRandomParagraph(3));
  }, []);

  // Helper function to count consecutive wrong characters from the end
  const countConsecutiveWrongChars = (
    input: string,
    targetText: string
  ): number => {
    let count = 0;
    for (let i = input.length - 1; i >= 0; i--) {
      if (input[i] !== targetText[i]) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  // Get which hand types a character based on current layout
  const getHandForChar = useCallback(
    (char: string): "left" | "right" | "space" => {
      const lowerChar = char.toLowerCase();
      if (char === " ") return "space";
      const currentLayout = KEYBOARD_LAYOUTS[layout];
      if (currentLayout.leftHand.has(lowerChar)) return "left";
      if (currentLayout.rightHand.has(lowerChar)) return "right";
      return "space"; // Default for unknown characters
    },
    [layout]
  );

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

  // Calculate WPM for specific hand with accurate timing
  const calculateHandWPM = useCallback(
    (hand: "left" | "right") => {
      if (!startTime || !endTime || charTimestamps.length === 0) return 0;

      // Find all characters typed by this hand and their timestamps
      const handCharIndices: number[] = [];
      for (let i = 0; i < userInput.length; i++) {
        const charHand = getHandForChar(text[i]);
        if (charHand === hand) {
          handCharIndices.push(i);
        }
      }

      if (handCharIndices.length === 0) return 0;

      // Calculate actual typing time for this hand
      let totalHandTime = 0;

      for (let i = 0; i < handCharIndices.length; i++) {
        const charIndex = handCharIndices[i];
        const currentTimestamp = charTimestamps[charIndex];

        // For the first character of this hand, measure from the previous character (or start)
        const prevTimestamp =
          charIndex > 0 ? charTimestamps[charIndex - 1] : startTime;

        // Add the time it took to type this character
        totalHandTime += currentTimestamp - prevTimestamp;
      }

      // Convert to WPM (chars / 5 = words, time in ms to minutes)
      const words = handCharIndices.length / 5;
      const minutes = totalHandTime / 60000;

      return minutes > 0 ? Math.round(words / minutes) : 0;
    },
    [startTime, endTime, charTimestamps, userInput, text, getHandForChar]
  );

  // Calculate overall WPM
  const calculateWPM = () => {
    if (!startTime || !endTime) return 0;
    const timeInMinutes = (endTime - startTime) / 60000;
    const wordsTyped = userInput.trim().split(" ").length;
    return Math.round(wordsTyped / timeInMinutes);
  };

  // Fetch and post community average
  const handleTestComplete = useCallback(async () => {
    console.log("handleTestComplete called");

    const leftWPM = calculateHandWPM("left");
    const rightWPM = calculateHandWPM("right");

    console.log("Left WPM:", leftWPM, "Right WPM:", rightWPM);

    if (leftWPM === 0 || rightWPM === 0) {
      console.log("One hand has 0 WPM, skipping");
      return;
    }

    const userRatio = rightWPM / leftWPM;
    console.log("User ratio:", userRatio, "Layout:", layout);

    try {
      setIsLoadingAverage(true);

      // Post user's ratio
      console.log(
        "Posting to:",
        `/api/ratio/${layout}`,
        "with ratio:",
        userRatio
      );
      const postResponse = await fetch(`/api/ratio/${layout}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratio: userRatio }),
      });

      console.log("Post response status:", postResponse.status);

      if (postResponse.ok) {
        const data = await postResponse.json();
        console.log("Post response data:", data);
        setCommunityAverage(data.average);
        setCommunityCount(data.count);
      } else {
        console.log("Post failed, trying GET");
        // If post fails, still try to get the average
        const getResponse = await fetch(`/api/ratio/${layout}`);
        if (getResponse.ok) {
          const data = await getResponse.json();
          setCommunityAverage(data.average);
          setCommunityCount(data.count);
        }
      }
    } catch (error) {
      console.error("Error handling community average:", error);
      // Try to at least fetch the average
      try {
        const response = await fetch(`/api/ratio/${layout}`);
        if (response.ok) {
          const data = await response.json();
          setCommunityAverage(data.average);
          setCommunityCount(data.count);
        }
      } catch (fetchError) {
        console.error("Error fetching average:", fetchError);
      }
    } finally {
      setIsLoadingAverage(false);
    }
  }, [layout, calculateHandWPM]);

  // Handle test completion when all data is ready
  useEffect(() => {
    if (isFinished && endTime && charTimestamps.length > 0) {
      // Small delay to ensure all state updates are complete
      const timer = setTimeout(() => {
        handleTestComplete();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isFinished, endTime, charTimestamps.length, layout, handleTestComplete]);

  // Update handleInputChange to call handleTestComplete when finished
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Start timer on first character
    if (!isStarted && value.length === 1) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    // Allow typing up to the text length
    if (value.length <= text.length) {
      // Check for consecutive wrong characters before allowing new input
      if (value.length > userInput.length) {
        // Count current consecutive wrong chars before adding the new one
        const currentConsecutiveWrong = countConsecutiveWrongChars(
          userInput,
          text
        );

        // Check if the new character would be wrong
        const newCharIndex = value.length - 1;
        const targetChar = text[newCharIndex];
        const typedChar = value[newCharIndex];
        const isNewCharWrong = typedChar !== targetChar;

        // If we already have 5 consecutive wrong chars and the new one is also wrong, block it
        if (currentConsecutiveWrong >= 5 && isNewCharWrong) {
          // Flash the input border red to indicate the limit
          const input = inputRef.current;
          if (input) {
            input.style.borderColor = "#ef4444";
            setTimeout(() => {
              input.style.borderColor = "";
            }, 200);
          }
          return; // Don't allow the input
        }
      }

      // Track hand statistics and timestamp for new character
      if (value.length > userInput.length) {
        const newCharIndex = value.length - 1;
        const targetChar = text[newCharIndex];
        const typedChar = value[newCharIndex];
        const hand = getHandForChar(targetChar);

        // Record timestamp for this character
        const newTimestamp = Date.now();
        setCharTimestamps((prev) => [...prev, newTimestamp]);

        if (hand === "left") {
          setLeftHandStats((prev) => ({
            correct: prev.correct + (typedChar === targetChar ? 1 : 0),
            total: prev.total + 1,
          }));
        } else if (hand === "right") {
          setRightHandStats((prev) => ({
            correct: prev.correct + (typedChar === targetChar ? 1 : 0),
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
        setIsLoadingAverage(true); // Start loading immediately
        // Remove the setTimeout here - now handled by useEffect
      }
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
    setCharTimestamps([]);
    setCommunityAverage(null);
    setCommunityCount(null);
    setIsLoadingAverage(false);
    inputRef.current?.focus();
  };

  const newQuote = () => {
    setText(generateRandomParagraph(3));
    reset();
    // Keep input focused
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const changeLayout = (newLayout: LayoutType) => {
    setLayout(newLayout);
    // Keep input focused
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep input focused when clicking anywhere
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't refocus if clicking inside the input
      if (e.target !== inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
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
        className =
          userInput[index] === char
            ? "text-green-500"
            : "text-red-500 bg-red-900/50";
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

  // Don't render main content until text is loaded
  if (!text) {
    return (
      <div className="min-h-screen bg-black text-white p-8 font-mono flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-2xl mb-8 text-center text-white">
            How fast is your left / right hand?
          </h1>
          <div className="text-center text-gray-500">
            <span className="animate-pulse">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate hand balance feedback
  const calculateHandBalance = () => {
    const leftWPM = calculateHandWPM("left");
    const rightWPM = calculateHandWPM("right");

    // Avoid division by zero
    if (leftWPM === 0 || rightWPM === 0) {
      return {
        statement: "Not enough data to compare hand speeds.",
        statementClass: "text-gray-400",
        details: "",
        userRatio: 0,
      };
    }

    // Calculate user's speed ratio
    const userRatio = rightWPM / leftWPM;

    // Use community average if available, otherwise fall back to research average
    const AVERAGE_SPEED_RATIO = communityAverage || 1.05;
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
      )}% as fast as your left (${
        communityAverage ? "community" : "research"
      } average: ${(AVERAGE_SPEED_RATIO * 100).toFixed(0)}%)`;
    } else if (userRatio > AVERAGE_SPEED_RATIO) {
      // Right hand is disproportionately faster
      statement = `Your right hand is disproportionately faster than ${
        communityAverage ? "the community" : "average"
      }.`;
      statementClass = "text-purple-400";
      details = `Your right hand is ${(userRatio * 100).toFixed(
        0
      )}% as fast as your left (${
        communityAverage ? "community" : "research"
      } average: ${(AVERAGE_SPEED_RATIO * 100).toFixed(0)}%)`;
    } else {
      // Left hand is disproportionately faster
      statement = `Your left hand is disproportionately faster than ${
        communityAverage ? "the community" : "average"
      }.`;
      statementClass = "text-blue-400";
      details = `Your right hand is only ${(userRatio * 100).toFixed(
        0
      )}% as fast as your left (${
        communityAverage ? "community" : "research"
      } average: ${(AVERAGE_SPEED_RATIO * 100).toFixed(0)}%)`;
    }

    return { statement, statementClass, details, userRatio };
  };

  // Calculate accuracy
  const calculateAccuracy = () => {
    if (userInput.length === 0) return 100;
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) {
        correctChars++;
      }
    }
    return Math.round((correctChars / userInput.length) * 100);
  };

  // Calculate hand-specific accuracy
  const calculateHandAccuracy = (hand: "left" | "right") => {
    const stats = hand === "left" ? leftHandStats : rightHandStats;
    if (stats.total === 0) return 100;
    return Math.round((stats.correct / stats.total) * 100);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl mb-8 text-center text-white">
          How fast is your left / right hand?
        </h1>

        {/* Layout selector */}
        <div className="flex gap-2 justify-center mb-8 text-xs">
          {Object.entries(KEYBOARD_LAYOUTS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => changeLayout(key as LayoutType)}
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
              <div className="flex gap-4">
                <button
                  onClick={newQuote}
                  className="px-4 py-2 border border-gray-700 hover:border-white hover:text-white transition-colors rounded"
                >
                  [new]
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 border border-gray-700 hover:border-white hover:text-white transition-colors rounded"
                >
                  [retry]
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-12 p-8 border border-gray-700 bg-black rounded">
              <h2 className="text-xl mb-8 text-white">{`// results`}</h2>

              {/* Overall stats */}
              <div className="text-4xl font-bold text-green-500 mb-2">
                {calculateWPM()} wpm
              </div>
              <div className="text-sm text-gray-400 mb-2">
                completed in {((endTime! - startTime!) / 1000).toFixed(1)}s
              </div>
              <div className="text-2xl font-bold text-yellow-500 mb-8">
                {calculateAccuracy()}% accuracy
              </div>

              {/* Hand-specific stats */}
              <div className="border-t border-gray-800 pt-6 mt-6">
                <h3 className="text-sm text-gray-400 mb-4">
                  {`// hand performance [${KEYBOARD_LAYOUTS[layout].name}]`}
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
                    <div className="text-sm text-gray-600">
                      {calculateHandAccuracy("left")}% accuracy
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
                    <div className="text-sm text-gray-600">
                      {calculateHandAccuracy("right")}% accuracy
                    </div>
                  </div>
                </div>

                {/* Hand balance analysis */}
                <div className="mt-6 pt-4 border-t border-gray-800">
                  {isLoadingAverage ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-gray-500 animate-pulse">
                        Calculating community comparison...
                      </div>
                    </div>
                  ) : (
                    <>
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
                                  {communityAverage
                                    ? "community avg"
                                    : "typical ratio"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {communityAverage
                                    ? `right hand ~${Math.round(
                                        (communityAverage - 1) * 100
                                      )}% ${
                                        communityAverage > 1
                                          ? "faster"
                                          : "slower"
                                      }`
                                    : "right hand ~5% faster"}
                                </div>
                              </div>
                            </div>

                            {/* Community stats */}
                            {communityCount && communityCount > 0 && (
                              <div className="text-xs text-gray-600 text-center mt-2">
                                based on {communityCount}{" "}
                                {communityCount === 1 ? "person" : "people"}{" "}
                                using {KEYBOARD_LAYOUTS[layout].name}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 justify-center text-sm mt-8">
                <button
                  onClick={newQuote}
                  className="px-4 py-2 border border-gray-700 hover:border-white hover:text-white transition-colors rounded"
                >
                  [new_text]
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 border border-gray-700 hover:border-white hover:text-white transition-colors rounded"
                >
                  [retry]
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-gray-500 text-xs mt-16 space-y-1">
          <p>{`// type the text as fast as you can`}</p>
          <p>{`// we will compare your left/right hand speed to the community average`}</p>
          <p>{`// errors allowed - accuracy tracked`}</p>
        </div>
      </div>
    </div>
  );
}
