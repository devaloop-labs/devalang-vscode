import * as fs from 'fs';
import * as path from 'path';

const wasmSourcePath = path.resolve(__dirname, '../../pkg/web');
const wasmDestPath = path.resolve(__dirname, '../../dist/plugin/pkg');

fs.cpSync(wasmSourcePath, wasmDestPath, { recursive: true });

console.log(`Copied package from ${wasmSourcePath} to ${wasmDestPath}`);
