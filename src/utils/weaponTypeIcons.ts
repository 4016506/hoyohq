import type { Weapon } from '../types/character';

// Import weapon type icons
import bowIcon from '../images/weapon_type_icons/UI_GachaTypeIcon_Bow.png';
import catalystIcon from '../images/weapon_type_icons/UI_GachaTypeIcon_Catalyst.png';
import claymoreIcon from '../images/weapon_type_icons/UI_GachaTypeIcon_Claymore.png';
import polearmIcon from '../images/weapon_type_icons/UI_GachaTypeIcon_Pole.png';
import swordIcon from '../images/weapon_type_icons/UI_GachaTypeIcon_Sword.png';

export const WEAPON_TYPE_ICONS: Record<Weapon, string> = {
  Bow: bowIcon,
  Catalyst: catalystIcon,
  Claymore: claymoreIcon,
  Polearm: polearmIcon,
  Sword: swordIcon,
};

export const getWeaponTypeIcon = (weapon: Weapon): string => {
  return WEAPON_TYPE_ICONS[weapon];
};
