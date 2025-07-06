import * as vscode from 'vscode';

export function loadVSCodePlugin(context: vscode.ExtensionContext, output: vscode.OutputChannel) {
    const pluginPath = context.asAbsolutePath("dist/plugin/index.js");

    try {
        const rawPlugin = require(pluginPath);
        const plugin = rawPlugin.default || rawPlugin;

        output.appendLine("✅ Plugin loaded from : " + pluginPath);

        return plugin;
    } catch (err: any) {
        output.appendLine("❌ Error loading plugin : " + err.message);
        return;
    }
}