import type { WeaponData } from '../types/weapon';
import weaponsCSV from './weapons.csv?raw';

let weaponsCache: WeaponData[] | null = null;

export function parseWeaponsCSV(): WeaponData[] {
  if (weaponsCache) {
    return weaponsCache;
  }

  const lines = weaponsCSV.split('\n');
  const weapons: WeaponData[] = [];

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
      const [name, type, rarityStr, iconPath] = fields;
      // Extract just the filename from the CSV path
      const weaponFileName = iconPath.trim().split('/').pop() || '';
      
      weapons.push({
        name: name.trim(),
        type: type.trim(),
        rarity: parseInt(rarityStr.trim()),
        iconPath: weaponFileName
      });
    }
  }

  weaponsCache = weapons;
  return weapons;
}

export function getWeaponsByType(weaponType: string): WeaponData[] {
  const allWeapons = parseWeaponsCSV();
  return allWeapons.filter(weapon => weapon.type === weaponType);
}

export function getWeaponByName(weaponName: string): WeaponData | undefined {
  const allWeapons = parseWeaponsCSV();
  return allWeapons.find(weapon => weapon.name === weaponName);
}

