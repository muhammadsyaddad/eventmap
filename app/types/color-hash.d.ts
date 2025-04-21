declare module 'color-hash' {
  export default class ColorHash {
    constructor(options?: {
      lightness?: number | number[];
      saturation?: number | number[];
      hue?: number | number[] | { min: number; max: number };
    });
    hex(str: string): string;
    rgb(str: string): number[];
    hsl(str: string): number[];
  }
} 