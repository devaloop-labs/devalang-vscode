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
        const lines = text.split("\n");

        try {
            // NOTE: No need to parse the parse result again
            const parseResult = await this.plugin.parsers.deva.parse(document.uri.fsPath, text); // ← Calling the parser

            const diags: vscode.Diagnostic[] = [];

            const pathChecker = new PathChecker();
            const pathErrors = await pathChecker.checkPaths(parseResult, document.uri.fsPath, this.plugin);

            if (pathErrors.length > 0) {
                this.output.appendLine(`❌ Path errors detected: ${JSON.stringify(pathErrors)}`);
                this.appendErrorsToDiagnostics(diags, pathErrors, lines);
            }

            this.appendErrorsToDiagnostics(
                diags,
                parseResult.diagnostics,
                lines,
            );

            // Update diagnostics collection
            this.diagnostics.set(document.uri, diags);

            return this.diagnostics;
        } catch (error: any) {
            this.output.appendLine(`❌ Parsing error: ${JSON.stringify(error)}`);

            vscode.window.showErrorMessage("Parsing error in DevaLang file.");

            return;
        }
    }

    private appendErrorsToDiagnostics(
        diags: vscode.Diagnostic[],
        parseDiagnostics: any,
        lines: string[]
    ): void {
        if (parseDiagnostics.errors && parseDiagnostics.errors.length) {
            this.output.appendLine(`❌ Errors detected: ${JSON.stringify(parseDiagnostics.errors)}`);

            for (const err of parseDiagnostics.errors) {
                const line = err.line ?? 0;
                const msg = err.message ?? "Unknown error";

                const range = new vscode.Range(
                    new vscode.Position(line, 0),
                    new vscode.Position(line, lines[line]?.length ?? 1)
                );

                diags.push(
                    new vscode.Diagnostic(range, msg, vscode.DiagnosticSeverity.Error)
                );
            }
        }
    }

}