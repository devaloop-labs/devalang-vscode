import * as vscode from 'vscode';
import { loadVSCodePlugin } from './vscode/pluginLoader';
import { Analyzer } from './vscode/analyzer';
import { Formatter } from './vscode/formatter';

export function activate(context: vscode.ExtensionContext) {
	const output = vscode.window.createOutputChannel("Devalang");

	output.appendLine("🧩 Devalang extension enabled");

	// NOTE: Uncomment the line below to show the output channel automatically when the extension is activated
	// output.show(true);

	const diagnostics = vscode.languages.createDiagnosticCollection("deva");
	context.subscriptions.push(diagnostics);

	const plugin = loadVSCodePlugin(context, output);

	// Initialize the analyzer and formatter
	const analyzer = new Analyzer(context, output, diagnostics, plugin);
	const formatter = new Formatter(context, output);

	// Register events
	analyzer.subscribeToWorkspaceEvents();

	// Formatter on ALT+SHIFT+F
	const formattingEvent = vscode.languages.registerDocumentFormattingEditProvider("deva", {
		async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
			const text = document.getText();

			const formattedText = await formatter.format(document.getText(), document.uri.fsPath);

			output.appendLine("📝 Formatage du document (ALT+SHIFT+F)...");

			return [
				vscode.TextEdit.replace(
					new vscode.Range(
						document.positionAt(0),
						document.positionAt(text.length)
					),
					formattedText
				)
			];
		}
	});

	context.subscriptions.push(formattingEvent);
}

export function deactivate() { }
