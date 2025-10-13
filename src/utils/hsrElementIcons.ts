import type { HSRElement } from '../types/hsr-character';

// Import HSR element icons
import fireIcon from '../images/hsr_element_icons/fire.webp';
import iceIcon from '../images/hsr_element_icons/ice.webp';
import imaginaryIcon from '../images/hsr_element_icons/imaginary.webp';
import lightningIcon from '../images/hsr_element_icons/lightning.webp';
import physicalIcon from '../images/hsr_element_icons/physical.webp';
import quantumIcon from '../images/hsr_element_icons/quantum.webp';
import windIcon from '../images/hsr_element_icons/wind.webp';

export const HSR_ELEMENT_ICONS: Record<HSRElement, string> = {
  Physical: physicalIcon,
  Fire: fireIcon,
  Ice: iceIcon,
  Lightning: lightningIcon,
  Wind: windIcon,
  Quantum: quantumIcon,
  Imaginary: imaginaryIcon,
};

export const getHSRElementIcon = (element: HSRElement): string => {
  return HSR_ELEMENT_ICONS[element];
};

