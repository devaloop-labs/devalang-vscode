import * as vscode from 'vscode';
import * as path from 'path';

export class Formatter {
    private context: vscode.ExtensionContext;
    private output: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext, output: vscode.OutputChannel) {
        this.context = context;
        this.output = output;
    }

    public async format(text: string, filepath: string): Promise<string> {
        const prettier = await import("prettier");

        try {
            const pluginPath = path.join(
                this.context.extensionPath,
                "node_modules",
                "@devaloop/prettier-plugin-devalang",
                "dist",
                "index.js"
            );

            const formatted = await prettier.format(text, {
                parser: "devalang",
                plugins: [pluginPath],
                filepath: filepath.endsWith(".deva") ? filepath : filepath + ".deva",
                tabWidth: 4,
                useTabs: true,
                bracketSpacing: true
            });

            this.output.appendLine("✅ Formatted document successfully.");

            return formatted;
        } catch (error) {
            let errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            
            this.output.appendLine(`❌ Error formatting document: ${errorMessage}`);

            return text;
        }
    }

}