// Dynamically import all weapon icons
const iconModules = import.meta.glob('../images/weapon_icons/*.png', { eager: true, as: 'url' });

// Create a map of filename to URL
export const weaponIconUrls: Record<string, string> = {};

Object.keys(iconModules).forEach((path) => {
  const filename = path.split('/').pop() || '';
  weaponIconUrls[filename] = iconModules[path] as string;
});

// Helper function to get weapon icon URL
export function getWeaponIconUrl(filename: string): string {
  return weaponIconUrls[filename] || '';
}

