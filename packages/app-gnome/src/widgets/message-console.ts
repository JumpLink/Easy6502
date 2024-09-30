import GObject from '@girs/gobject-2.0'
import Adw from '@girs/adw-1'
import Gtk from '@girs/gtk-4.0'

import Template from './message-console.blp'

import type { MessageConsole as MessageConsoleInterface } from '@easy6502/6502'

export interface MessageConsole {
  // Child widgets
  _textView: Gtk.TextView
}

export class MessageConsole extends Adw.Bin implements MessageConsoleInterface {

  static {
    GObject.registerClass({
      GTypeName: 'MessageConsole',
      Template,
      InternalChildren: ['textView']
    }, this);
  }

  constructor(params: Partial<Adw.Bin.ConstructorProps>) {
    super(params)
  }

  public log(message: string) {
    message += '\n'; // allow put operations from the simulator (WDM opcode)
    this._textView.buffer.insert_at_cursor(message, message.length);
  }

  public warn(message: string) {
    this._textView.buffer.insert_at_cursor(`\n\n${message}`, message.length);
  }

  public error(message: string) {
    this._textView.buffer.insert_at_cursor(`\n\n${message}`, message.length);
  }

  public clear() {
    this._textView.buffer.set_text('', 0);
  }

  public prompt(message: string, defaultValue?: string): string | null {
    throw new Error('Not implemented')
  }
}
