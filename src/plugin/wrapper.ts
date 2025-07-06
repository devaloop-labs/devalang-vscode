import * as fs from "fs";
import * as path from "path";

import init, { parse as wasmParse } from "../../pkg/devalang";

let initialized = false;

async function loadWasm(): Promise<void> {
    if (initialized) {
        return;
    }

    const wasmPath = path.resolve(__dirname, "pkg/devalang_bg.wasm");
    const wasmBinary = fs.readFileSync(wasmPath);
    await init(wasmBinary);

    initialized = true;
}

export async function parse(source: string, filePath: string): Promise<any> {
    await loadWasm();

    try {
        const result = await wasmParse(source, filePath);
        return result;
    } catch (e: any) {
        return {
            ok: false,
            error: e
        };
    }
}
