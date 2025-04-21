import ColorHash from 'color-hash';

const colorHash = new ColorHash();

// Cache untuk menyimpan warna yang sudah di-generate
const colorCache = new Map<string, string>();

// Mendapatkan kata pertama dari string (biasanya jenis lokasi)
export const getLocationType = (name: string): string => {
  return name.toLowerCase().split(' ')[0];
};

// Generate atau ambil warna dari cache berdasarkan jenis lokasi
export const getLocationColor = (name: string): string => {
  const locationType = getLocationType(name);
  
  if (!colorCache.has(locationType)) {
    colorCache.set(locationType, colorHash.hex(locationType));
  }
  
  return colorCache.get(locationType) || '#3b82f6'; // default blue if something goes wrong
};

// Convert string to title case
export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}; 