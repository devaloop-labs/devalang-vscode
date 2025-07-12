import * as vscode from 'vscode';
import { Checker } from './checker';

export class Analyzer {
    private context: vscode.ExtensionContext;
    private output: vscode.OutputChannel;
    private diagnostics: vscode.DiagnosticCollection;
    private plugin: any;

    private checker: Checker;

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

        const checker = new Checker(context, output, diagnostics, plugin);
        this.checker = checker;
    }

    public analyzeDocument(document: vscode.TextDocument) {
        if (document.languageId !== "deva") {
            return;
        }

        this.output.appendLine(`🔍 Checking document: ${document.uri.fsPath}`);

        let diagnostics = this.checker.checkSyntax(document);

        return diagnostics;
    }

    public subscribeToWorkspaceEvents() {
        const documentOpenEvent = vscode.workspace.onDidOpenTextDocument(async (document) => {
            if (document.languageId === 'deva') {
                this.output.appendLine(`📄 Document opened: ${document.uri.fsPath}`);

                let diagnosticsResult = await this.analyzeDocument(document);

                if (!diagnosticsResult) {
                    this.output.appendLine(`❗ No diagnostics found for ${document.uri.fsPath}`);
                }
            }
        });

        const documentChangeEvent = vscode.workspace.onDidChangeTextDocument(async (event) => {
            if (event.document.languageId === 'deva') {
                this.output.appendLine(`📄 Document edited : ${event.document.uri.fsPath}`);

                let diagnosticsResult = await this.analyzeDocument(event.document);

                if (!diagnosticsResult) {
                    this.output.appendLine(`❗ No diagnostics found for ${event.document.uri.fsPath}`);
                }
            }
        });

        this.context.subscriptions.push(documentOpenEvent);
        this.context.subscriptions.push(documentChangeEvent);
    }

}