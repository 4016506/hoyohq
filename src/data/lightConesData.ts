import type { LightConeData } from '../types/light-cone';
import lightConesCSV from './light_cones.csv?raw';

let lightConesCache: LightConeData[] | null = null;

export function parseLightConesCSV(): LightConeData[] {
  if (lightConesCache) {
    return lightConesCache;
  }

  const lines = lightConesCSV.split('\n');
  const lightCones: LightConeData[] = [];

  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line handling quoted fields
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          // Double quote escape
          currentField += '"';
          j++;
        } else {
          // Toggle quotes
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField);

    if (fields.length >= 4) {
      const [name, path, rarityStr, iconPath] = fields;
      // Extract just the filename from the CSV path
      const lcFileName = iconPath.trim().split('/').pop() || '';
      
      lightCones.push({
        name: name.trim(),
        path: path.trim(),
        rarity: parseInt(rarityStr.trim()),
        iconPath: lcFileName
      });
    }
  }

  lightConesCache = lightCones;
  return lightCones;
}

export function getLightConesByPath(path: string): LightConeData[] {
  const allLightCones = parseLightConesCSV();
  return allLightCones.filter(lc => lc.path === path);
}

export function getAllLightCones(): LightConeData[] {
  return parseLightConesCSV();
}

export function getLightConeByName(lightConeName: string): LightConeData | undefined {
  const allLightCones = parseLightConesCSV();
  return allLightCones.find(lc => lc.name === lightConeName);
}

