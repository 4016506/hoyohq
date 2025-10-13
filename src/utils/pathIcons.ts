import type { Path } from '../types/hsr-character';

// Import path icons
import abundanceIcon from '../images/path_icons/abundance.webp';
import destructionIcon from '../images/path_icons/destruction.webp';
import eruditionIcon from '../images/path_icons/erudition.webp';
import harmonyIcon from '../images/path_icons/harmony.webp';
import huntIcon from '../images/path_icons/hunt.webp';
import nihilityIcon from '../images/path_icons/nihility.webp';
import preservationIcon from '../images/path_icons/preservation.webp';
import remembranceIcon from '../images/path_icons/remembrance.webp';

export const PATH_ICONS: Record<Path, string> = {
  Abundance: abundanceIcon,
  Destruction: destructionIcon,
  Erudition: eruditionIcon,
  Harmony: harmonyIcon,
  Hunt: huntIcon,
  Nihility: nihilityIcon,
  Preservation: preservationIcon,
  Remembrance: remembranceIcon,
};

export const getPathIcon = (path: Path): string => {
  return PATH_ICONS[path];
};

