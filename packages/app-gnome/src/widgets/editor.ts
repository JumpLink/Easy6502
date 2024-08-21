import GObject from '@girs/gobject-2.0'
import Adw from '@girs/adw-1'
import Gtk from '@girs/gtk-4.0'
import GtkSource from '@girs/gtksource-5'

import Template from './editor.ui?raw'

interface _Editor {
  // Child widgets
  _scrolledWindow: Gtk.ScrolledWindow
}

GtkSource.init()

/**
 * @class Editor to edit 6502 assembly code
 * 
 * @emits changed - Emitted when the buffer's text changes
 */
class _Editor extends Adw.Bin {
  /** The buffer that holds the text that's used in the SourceView */
  private _buffer: GtkSource.Buffer;
  /** The SourceView that displays the buffer's display */
  private _sourceView: GtkSource.View;

  /** The style scheme manager */
  private schemeManager = GtkSource.StyleSchemeManager.get_default();

  /** The style manager */
  private styleManager = Adw.StyleManager.get_default();

  constructor(params: Partial<Adw.Bin.ConstructorProps>) {
    super(params)

    // TODO: Add 6502 assembly language support

    // Get the language we want to use
    // const language_manager = GtkSource.LanguageManager.get_default();
    // const language = language_manager.get_language("js");

    // if(!language) {
    //   const supportedLanguages = language_manager.get_language_ids()
    //   throw new Error(`Language not found, supported languages: ${supportedLanguages?.join(', ')}`)
    // }

    // // Create the buffer - this holds the text that's used in the SourceView
    // const buffer = GtkSource.Buffer.new_with_language(language);

    this._buffer = new GtkSource.Buffer();

    this._buffer.set_text('LDA #$01\nSTA $0200\nLDA #$05\nSTA $0201\nLDA #$08\nSTA $0202', -1);

    // Create the SourceView which displays the buffer's display
    this._sourceView = new GtkSource.View({
      auto_indent: true,
      indent_width: 4,
      buffer: this._buffer,
      show_line_numbers: true,
    });

    this._scrolledWindow.set_child(this._sourceView)

    this.setupSignalListeners();
    this.updateStyle();
  }

  public getBuffer(): GtkSource.Buffer {
    return this._buffer;
  }

  private setupSignalListeners() {
    // cannot use "changed" signal as it triggers many time for pasting
    this._buffer.connect('end-user-action', this.onUpdate.bind(this));
    this._buffer.connect('undo', this.onUpdate.bind(this));
    this._buffer.connect('redo', this.onUpdate.bind(this));

    this.styleManager.connect('notify::dark', this.updateStyle.bind(this));
  }

  private onUpdate() {
    this.emit("changed");
  };

  private updateStyle() {
    const scheme = this.schemeManager.get_scheme(
      this.styleManager.dark ? "Adwaita-dark" : "Adwaita",
    );
    this._buffer.set_style_scheme(scheme);
  };
}

export const Editor = GObject.registerClass(
  {
    GTypeName: 'Editor',
    Template,
    InternalChildren: ['scrolledWindow'],
    Signals: {
      'changed': {
        param_types: [],
      },
    },
  },
  _Editor
)
