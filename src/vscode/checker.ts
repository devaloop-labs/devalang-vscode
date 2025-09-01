import * as vscode from 'vscode';
import { PathChecker } from './pathChecker';

export class Checker {
    private context: vscode.ExtensionContext;
    private output: vscode.OutputChannel;
    private diagnostics: vscode.DiagnosticCollection;
    private plugin: any;

    constructor(
        context: vscode.ExtensionContext,
        output: vscode.OutputChannel,
        diagnostics: vscode.DiagnosticCollection,
        plugin: any
    ) {
        this.context = context;
        this.output = output;
        this.diagnostics = diagnostics;
        this.plugin = plugin;
    }

    public async checkSyntax(document: vscode.TextDocument): Promise<vscode.DiagnosticCollection | undefined> {
        const text = document.getText();
        const lines = text.split('\n');

        try {
            // parse(filePath, source)
            const parseResult = await this.plugin.parsers.deva.parse(document.uri.fsPath, text);

            const diags: vscode.Diagnostic[] = [];

            if (!parseResult || parseResult.ok === false) {
                const err = parseResult?.error ?? parseResult ?? { message: 'Unknown parse failure' };
                this.output.appendLine(`⚠️ Parser failure: ${JSON.stringify(err)}`);
                this.diagnostics.set(document.uri, []);
                return this.diagnostics;
            }

            const pathChecker = new PathChecker();
            const pathErrors = await pathChecker.checkPaths(parseResult, document.uri.fsPath, this.plugin);

            if (pathErrors && pathErrors.length > 0) {
                this.output.appendLine(`❌ Path errors detected: ${JSON.stringify(pathErrors)}`);
                this.appendErrorsToDiagnostics(diags, pathErrors, lines);
            }

            if (parseResult && parseResult.diagnostics) {
                this.appendErrorsToDiagnostics(diags, parseResult.diagnostics, lines);
            }

            this.diagnostics.set(document.uri, diags);
            return this.diagnostics;
        } catch (e: any) {
            this.output.appendLine(`❌ Parsing exception: ${JSON.stringify(e)}`);
            this.diagnostics.set(document.uri, []);
            return;
        }
    }

    private appendErrorsToDiagnostics(diags: vscode.Diagnostic[], parseDiagnostics: any, lines: string[]): void {
    if (!parseDiagnostics) { return; }

    const errors = parseDiagnostics.errors ?? [];
    if (!errors.length) { return; }

        this.output.appendLine(`❌ Errors detected: ${JSON.stringify(errors)}`);

        for (const err of errors) {
            const line = err.line ?? 0;
            const msg = err.message ?? 'Unknown error';

            const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, lines[line]?.length ?? 1));
            diags.push(new vscode.Diagnostic(range, msg, vscode.DiagnosticSeverity.Error));
        }
    }
}