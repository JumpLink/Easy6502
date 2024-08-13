import type { Memory } from './memory.js';

/**
 * Represents the display for a 6502 emulator.
 */
export class Display {
  private palette: string[];
  private ctx: CanvasRenderingContext2D | null = null;
  private width: number = 0;
  private height: number = 0;
  private pixelSize: number = 0;
  private numX: number = 32;
  private numY: number = 32;

  /**
   * Creates a new Display instance.
   * @param node - The HTML element that will contain the display.
   */
  constructor(private node: HTMLElement) {
    this.palette = [
      "#000000", "#ffffff", "#880000", "#aaffee",
      "#cc44cc", "#00cc55", "#0000aa", "#eeee77",
      "#dd8855", "#664400", "#ff7777", "#333333",
      "#777777", "#aaff66", "#0088ff", "#bbbbbb"
    ];
  }

  /**
   * Initializes the display by setting up the canvas and context.
   * @throws {Error} If the canvas element is not found.
   */
  public initialize(): void {
    const canvas = this.node.querySelector<HTMLCanvasElement>('.screen');
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    this.width = canvas.width || 160;
    this.height = canvas.height || 160;
    this.pixelSize = this.width / this.numX;
    this.ctx = canvas.getContext('2d');
    this.reset();
  }

  /**
   * Resets the display to a black screen.
   */
  public reset(): void {
    if (!this.ctx) {
      return;
    }
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Updates a single pixel on the display.
   * @param addr - The memory address of the pixel.
   * @param memory - The Memory object containing the pixel data.
   */
  public updatePixel(addr: number, memory: Memory): void {
    if (!this.ctx) {
      return;
    }
    this.ctx.fillStyle = this.palette[memory.get(addr) & 0x0f];
    const y = Math.floor((addr - 0x200) / 32);
    const x = (addr - 0x200) % 32;
    this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
  }
}