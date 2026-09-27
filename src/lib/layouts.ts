export type Hand = "left" | "right";

type LayoutDef = {
  name: string;
  /** Letter rows, top to bottom. The first 5 keys of each row are left hand. */
  rows: [string, string, string];
};

export const LAYOUTS = {
  qwerty: { name: "qwerty", rows: ["qwertyuiop", "asdfghjkl;", "zxcvbnm,./"] },
  azerty: { name: "azerty", rows: ["azertyuiop", "qsdfghjklm", "wxcvbn,;:!"] },
  dvorak: { name: "dvorak", rows: ["',.pyfgcrl", "aoeuidhtns", ";qjkxbmwvz"] },
  colemak: {
    name: "colemak",
    rows: ["qwfpgjluy;", "arstdhneio", "zxcvbkm,./"],
  },
  colemakdh: {
    name: "colemak-dh",
    rows: ["qwfpbjluy;", "arstgmneio", "zxcdvkh,./"],
  },
  workman: {
    name: "workman",
    rows: ["qdrwbjfup;", "ashtgyneoi", "zxmcvkl,./"],
  },
} satisfies Record<string, LayoutDef>;

export type LayoutId = keyof typeof LAYOUTS;

export const LAYOUT_IDS = Object.keys(LAYOUTS) as LayoutId[];

export function isLayoutId(value: unknown): value is LayoutId {
  return typeof value === "string" && value in LAYOUTS;
}

const handMaps = new Map<LayoutId, Map<string, Hand>>();

function handMap(layout: LayoutId) {
  let map = handMaps.get(layout);
  if (!map) {
    map = new Map();
    for (const row of LAYOUTS[layout].rows) {
      [...row].forEach((key, i) => map!.set(key, i < 5 ? "left" : "right"));
    }
    handMaps.set(layout, map);
  }
  return map;
}

/** Which hand types this character, or null for space and unknown keys. */
export function handFor(layout: LayoutId, char: string): Hand | null {
  return handMap(layout).get(char.toLowerCase()) ?? null;
}
