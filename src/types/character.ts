export type Nation = "Mondstadt" | "Liyue" | "Inazuma" | "Sumeru" | "Fontaine" | "Natlan" | "Nod-Krai";
export type Element = "Pyro" | "Hydro" | "Cryo" | "Dendro" | "Electro" | "Anemo" | "Geo";
export type Weapon = "Bow" | "Sword" | "Catalyst" | "Claymore" | "Polearm";
export type Rarity = 4 | 5;
export type Status = "Unowned" | "WIP" | "Built";

export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  nation: Nation;
  element: Element;
  weapon: Weapon;
}

export interface UserCharacter {
  characterId: string;
  status: Status;
  constellation: number;
  refinement: number;
}

export interface User {
  id: string;
  name: string;
  characters: Record<string, UserCharacter>;
}

export const NATIONS: Nation[] = ["Mondstadt", "Liyue", "Inazuma", "Sumeru", "Fontaine", "Natlan", "Nod-Krai"];
export const ELEMENTS: Element[] = ["Pyro", "Hydro", "Cryo", "Dendro", "Electro", "Anemo", "Geo"];
export const WEAPONS: Weapon[] = ["Bow", "Sword", "Catalyst", "Claymore", "Polearm"];
export const STATUSES: Status[] = ["Unowned", "WIP", "Built"];

export const ELEMENT_COLORS = {
  Pyro: "bg-[#e79d6c]",
  Hydro: "bg-[#54b0f0]", 
  Cryo: "bg-[#88dbdc]",
  Dendro: "bg-[#b5dd47]",
  Electro: "bg-[#b993e4]",
  Anemo: "bg-[#7fdeac]",
  Geo: "bg-[#e3cd65]"
};

export const ELEMENT_TEXT_COLORS = {
  Pyro: "text-[#e79d6c]",
  Hydro: "text-[#54b0f0]", 
  Cryo: "text-[#88dbdc]",
  Dendro: "text-[#b5dd47]",
  Electro: "text-[#b993e4]",
  Anemo: "text-[#7fdeac]",
  Geo: "text-[#e3cd65]"
};

export const STATUS_COLORS = {
  Unowned: "bg-gray-500",
  WIP: "bg-yellow-500",
  Built: "bg-green-500"
};
