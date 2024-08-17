import { Memory } from './memory.js';
import { Display } from './display.js';
import { Labels } from './labels.js';
import { Simulator } from './simulator.js';
import { Assembler } from './assembler.js';
import { UI } from './ui.js';
import { MessageConsole } from './message-console.js';
import { Debugger } from './debugger.js';

/**
 * Represents the main widget for the 6502 simulator.
 */
export class SimulatorWidget {
  private console: MessageConsole;
  private ui: UI;
  private memory: Memory;
  private display: Display;
  private labels: Labels;
  private simulator: Simulator;
  private assembler: Assembler;
  private debugger: Debugger;

  /**
   * Creates a new SimulatorWidget instance.
   * @param node - The root HTML element for the simulator widget.
   */
  constructor(private node: HTMLElement) {

    this.console = new MessageConsole(node.querySelector('.messages code'));
    this.ui = new UI(node);
    this.memory = new Memory();
    this.display = new Display(node, this.memory);
    this.labels = new Labels(this.console);
    this.simulator = new Simulator(this.console, this.memory, this.display, this.labels, this.ui);
    this.assembler = new Assembler(this.console, this.memory, this.labels, this.ui);
    this.debugger = new Debugger(node, this.simulator, this.memory, {
      monitor: {
        start: 0x00,
        length: 0xff,
      },
    });
    this.initialize();
  }

  /**
   * Initializes the simulator widget and sets up event listeners.
   */
  private initialize(): void {
    this.stripText();
    this.ui.initialize();
    this.display.initialize();
    this.simulator.reset();

    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for various UI elements.
   */
  private setupEventListeners(): void {
    this.node.querySelector('.assembleButton')?.addEventListener('click', () => {
      this.simulator.reset();
      this.labels.reset();
      this.assembler.assembleCode(this.node.querySelector<HTMLTextAreaElement>('.code')?.value || "");
    });

    this.node.querySelector('.runButton')?.addEventListener('click', () => {
      this.simulator.stopStepper();
      this.simulator.runBinary();
    });

    this.node.querySelector('.resetButton')?.addEventListener('click', () => {
      this.simulator.reset();
    });

    this.node.querySelector('.hexdumpButton')?.addEventListener('click', () => {
      this.assembler.hexdump();
    });

    this.node.querySelector('.disassembleButton')?.addEventListener('click', () => {
      this.assembler.disassemble();
    });

    this.node.querySelector('.debug')?.addEventListener('change', (e: Event) => {
      const debug = (e.target as HTMLInputElement).checked;
      if (debug) {
        this.ui.debugOn();
        this.simulator.enableStepper();
      } else {
        this.ui.debugOff();
        this.simulator.stopStepper();
      }
    });

    this.node.querySelector('.monitoring')?.addEventListener('change', (e: Event) => {
      const state = (e.target as HTMLInputElement).checked;
      this.ui.toggleMonitor(state);
      this.debugger.toggleMonitor(state);
    });

    this.node.querySelector('.start, .length')?.addEventListener('blur', this.debugger.onMonitorRangeChange.bind(this.debugger));
    this.node.querySelector('.stepButton')?.addEventListener('click', this.simulator.debugExecStep.bind(this.simulator));
    this.node.querySelector('.gotoButton')?.addEventListener('click', this.simulator.gotoAddr.bind(this.simulator));
    this.node.querySelector('.notesButton')?.addEventListener('click', this.ui.showNotes.bind(this.ui));

    const editor = this.node.querySelector<HTMLTextAreaElement>('.code');
    editor?.addEventListener('keypress', this.simulator.stop.bind(this.simulator));
    editor?.addEventListener('keypress', this.ui.initialize.bind(this.ui));

    document.addEventListener('keypress', this.memory.storeKeypress.bind(this.memory));

    this.debugger.onMonitorRangeChange();
  }

  /**
   * Removes leading and trailing whitespace from the code textarea.
   */
  private stripText(): void {
    const code = this.node.querySelector<HTMLTextAreaElement>('.code');
    if (!code) {
      return;
    }
    let text = code.value;
    text = text.replace(/^\n+/, '').replace(/\s+$/, '');
    code.value = text;
  }
}