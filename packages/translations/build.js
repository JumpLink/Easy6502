import { gettextPlugin, xgettextPlugin } from '@easy6502/vite-plugin-gettext';
import { readFileSync } from 'node:fs'

const APPLICATION_ID = 'eu.jumplink.Easy6502';
const VERSION = JSON.parse(readFileSync('./package.json', 'utf8')).version;

// Extract translatable strings from source files to create a POT template
const xgettext = xgettextPlugin({
  sources: ['../app-gnome/src/**/*.{ts,js,blp,xml,desktop}', '../learn/dist/**/*.ui'],
  output: `./${APPLICATION_ID}.pot`,
  domain: APPLICATION_ID,
  // keywords: [],
  language: ['JavaScript', 'Glade'],
  preset: 'glib',
  verbose: true,
  version: VERSION,
  autoUpdatePo: true
});

// Compile PO files to MO files
const gettext = gettextPlugin({
  poDirectory: '.',
  moDirectory: './dist',
  filename: `${APPLICATION_ID}.mo`,
  verbose: true
});

// Start the extraction process
await xgettext.buildStart();
// Start the compilation process
await gettext.buildStart();
