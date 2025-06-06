// Keyboard layout definitions
export const KEYBOARD_LAYOUTS = {
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
  },
  azerty: {
    name: "AZERTY",
    leftHand: new Set([
      "a",
      "z",
      "e",
      "r",
      "t",
      "q",
      "s",
      "d",
      "f",
      "g",
      "w",
      "x",
      "c",
      "v",
      "b",
      "1",
      "2",
      "3",
      "4",
      "5",
      "&",
      "é",
      '"',
      "'",
      "(",
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
      "m",
      "n",
      "6",
      "7",
      "8",
      "9",
      "0",
      "-",
      "è",
      "_",
      "ç",
      "à",
      ")",
      "=",
      "+",
      "^",
      "¨",
      "$",
      "£",
      "ù",
      "*",
      ";",
      ":",
      "!",
      ",",
      ".",
      "<",
      ">",
      "/",
      "?",
      "§",
    ]),
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
  },
};

export type LayoutType = keyof typeof KEYBOARD_LAYOUTS;
