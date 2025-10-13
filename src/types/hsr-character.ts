export type Path = "Destruction" | "Hunt" | "Harmony" | "Erudition" | "Nihility" | "Preservation" | "Abundance" | "Remembrance";
export type HSRElement = "Physical" | "Fire" | "Ice" | "Lightning" | "Wind" | "Quantum" | "Imaginary";
export type Rarity = 4 | 5;
export type Status = "Unowned" | "WIP" | "Built";

export interface HSRCharacter {
  id: string;
  name: string;
  rarity: Rarity;
  path: Path;
  element: HSRElement;
  unitType: string;
  version: number;
}

export interface HSRUserCharacter {
  characterId: string;
  status: Status;
  eidolon: number; // 0-6 (E0 to E6)
  lightConeName: string;
  superposition: number; // 1-5 (S1 to S5)
}

export interface HSRUser {
  id: string;
  name: string;
  characters: Record<string, HSRUserCharacter>;
}

export const PATHS: Path[] = ["Destruction", "Hunt", "Harmony", "Erudition", "Nihility", "Preservation", "Abundance", "Remembrance"];
export const HSR_ELEMENTS: HSRElement[] = ["Physical", "Fire", "Ice", "Lightning", "Wind", "Quantum", "Imaginary"];
export const STATUSES: Status[] = ["Unowned", "WIP", "Built"];

export const HSR_ELEMENT_COLORS = {
  Physical: "bg-[#c8c8d0]",
  Fire: "bg-[#f08080]", 
  Ice: "bg-[#87ceeb]",
  Lightning: "bg-[#d8a1ff]",
  Wind: "bg-[#98d8a8]",
  Quantum: "bg-[#9090e8]",
  Imaginary: "bg-[#f8e888]"
};

export const HSR_ELEMENT_TEXT_COLORS = {
  Physical: "text-[#c8c8d0]",
  Fire: "text-[#f08080]", 
  Ice: "text-[#87ceeb]",
  Lightning: "text-[#d8a1ff]",
  Wind: "text-[#98d8a8]",
  Quantum: "text-[#9090e8]",
  Imaginary: "text-[#f8e888]"
};

export const STATUS_COLORS = {
  Unowned: "bg-gray-500",
  WIP: "bg-yellow-500",
  Built: "bg-green-500"
};

