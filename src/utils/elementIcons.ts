import type { Element } from '../types/character';

// Import element icons
import anemoIcon from '../images/element_icons/anemo.svg';
import cryoIcon from '../images/element_icons/cryo.svg';
import dendroIcon from '../images/element_icons/dendro.svg';
import electroIcon from '../images/element_icons/electro.svg';
import geoIcon from '../images/element_icons/geo.svg';
import hydroIcon from '../images/element_icons/hydro.svg';
import pyroIcon from '../images/element_icons/pyro.svg';

export const ELEMENT_ICONS: Record<Element, string> = {
  Anemo: anemoIcon,
  Cryo: cryoIcon,
  Dendro: dendroIcon,
  Electro: electroIcon,
  Geo: geoIcon,
  Hydro: hydroIcon,
  Pyro: pyroIcon,
};

export const getElementIcon = (element: Element): string => {
  return ELEMENT_ICONS[element];
};

