import GObject from '@girs/gobject-2.0'
import Adw from '@girs/adw-1'
import Gtk from '@girs/gtk-4.0'
import GtkSource from '@girs/gtksource-5'

import type { Memory, MonitorOptions } from '@easy6502/6502'

import Template from './hex-monitor.ui?raw'

interface _HexMonitor {
  // Child widgets
  _sourceView: GtkSource.View
}

class CustomGutterRenderer extends GtkSource.GutterRendererText {
  static {
      GObject.registerClass({
          GTypeName: 'CustomGutterRenderer',
      }, this);
  }

  constructor(params: Partial<GtkSource.GutterRendererText.ConstructorProps> = {}) {
      super(params);
  }

  public vfunc_query_data(gutter: GtkSource.GutterLines, line: number): void {
    const address = line * 0x10;
    const formattedAddress = address.toString(16).padStart(4, '0').toUpperCase();
    this.text = formattedAddress;
  }
}

/**
 * A widget that displays a hex monitor.
 * @emits changed - when the monitor content is updated
 */
class _HexMonitor extends Adw.Bin {

  public set text(value: string) {
    this.buffer.text = value;
    this.onUpdate();
  }

  private get buffer(): GtkSource.Buffer {
    return this._sourceView.buffer as GtkSource.Buffer;
  }

  private start: number = 0x0;
  private length: number = 0xffff;

  /** The style scheme manager */
  private schemeManager = GtkSource.StyleSchemeManager.get_default();

  /** The style manager */
  private styleManager = Adw.StyleManager.get_default();

  constructor(params: Partial<Adw.Bin.ConstructorProps> & MonitorOptions) {
    super(params)
    this.setupCustomLineNumbers();
    this.setupSignalListeners();
    this.updateStyle();
  }

  public update(memory: Memory) {

    let content = '';

    const end = this.start + this.length - 1;

    if (!isNaN(this.start) && !isNaN(this.length) && this.start >= 0 && this.length > 0 && end <= 0xffff) {
      content = memory.format({ start: this.start, length: this.length, includeAddress: false, includeSpaces: true, includeNewline: true });
    } else {
      content = 'Cannot monitor this range. Valid ranges are between $0000 and $ffff, inclusive.';
    }

    this._sourceView.buffer.set_text(content, content.length);
  }

  public setRange(startAddress: number, length: number): void {
    this.start = startAddress;
    this.length = length;
  }

  private setupSignalListeners() {
    // cannot use "changed" signal as it triggers many time for pasting
    this.buffer.connect('end-user-action', this.onUpdate.bind(this));
    this.buffer.connect('undo', this.onUpdate.bind(this));
    this.buffer.connect('redo', this.onUpdate.bind(this));

    this.styleManager.connect('notify::dark', this.updateStyle.bind(this));
  }

  setupCustomLineNumbers(): void {
    // Hide the default line numbers
    this._sourceView.show_line_numbers = false;
    const gutter = this._sourceView.get_gutter(Gtk.TextWindowType.LEFT);
    const customRenderer = new CustomGutterRenderer({
      margin_start: 12,
      margin_end: 12,
      width_request: 24,
      focus_on_click: false,
      focusable: false,
    });
    // Insert the custom line numbers renderer
    gutter.insert(customRenderer, 0);
    // this._sourceView.set_gutter(Gtk.TextWindowType.LEFT, gutter);
  }

  private onUpdate() {
    this.emit("changed");
  };

  private updateStyle() {
    const scheme = this.schemeManager.get_scheme(
      this.styleManager.dark ? "Adwaita-dark" : "Adwaita",
    );
    this.buffer.set_style_scheme(scheme);
  };

}

export const HexMonitor = GObject.registerClass(
  {
    GTypeName: 'HexMonitor',
    Template,
    InternalChildren: ['sourceView'],
    Signals: {
      'changed': {
        param_types: [],
      },
    },
  },
  _HexMonitor
)
