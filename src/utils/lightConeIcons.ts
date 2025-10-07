// Dynamically import all light cone icons
const iconModules = import.meta.glob('../images/lc_icons/*.png', { 
  eager: true, 
  query: '?url', 
  import: 'default' 
});

// Create a map of filename to URL
export const lightConeIconUrls: Record<string, string> = {};

Object.keys(iconModules).forEach((path) => {
  const filename = path.split('/').pop() || '';
  lightConeIconUrls[filename] = iconModules[path] as string;
});

// Helper function to get light cone icon URL
export function getLightConeIconUrl(filename: string): string {
  return lightConeIconUrls[filename] || '';
}

