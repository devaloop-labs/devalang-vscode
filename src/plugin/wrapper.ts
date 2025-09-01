import * as fs from "fs";
import * as path from "path";

import init, { parse as wasmParse } from "../../pkg/devalang_core";

let initialized = false;

async function loadWasm(): Promise<void> {
    if (initialized) {
        return;
    }

    // The Rust build produces `devalang_core_bg.wasm` in the pkg folder.
    const wasmPath = path.resolve(__dirname, "pkg/devalang_core_bg.wasm");
    const wasmBinary = fs.readFileSync(wasmPath);
    await init(wasmBinary);

    initialized = true;
}

export async function parse(source: string, filePath: string): Promise<any> {
    await loadWasm();

    try {
    // wasmParse(entry_path, source) — adapt calling order so wrapper keeps (source, filePath)
    const result = await wasmParse(filePath, source);
        return result;
    } catch (e: any) {
        return {
            ok: false,
            error: e
        };
    }
}
