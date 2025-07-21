import * as vscode from "vscode";
import * as path from "path";

export const createDevalangLinkProvider = (): vscode.DocumentLinkProvider => {
  return {
    provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
      const links: vscode.DocumentLink[] = [];
      const text = document.getText();
      const importRegex = /@import\s+\{[^}]*\}\s+from\s+"([^"]+)"/g;
      const loadRegex = /@load\s+"([^"]+)"\s+as\s+([a-zA-Z_][\w]*)/g;

      const processMatches = (regex: RegExp) => {
        let match;
        while ((match = regex.exec(text))) {
          const relativePath = match[1];
          const startIndex = match.index + match[0].indexOf(`"${relativePath}"`);
          const endIndex = startIndex + relativePath.length + 2; // +2 for quotes

          const startPos = document.positionAt(startIndex);
          const endPos = document.positionAt(endIndex);
          const range = new vscode.Range(startPos, endPos);

          const filePath = path.resolve(path.dirname(document.uri.fsPath), relativePath);
          const targetUri = vscode.Uri.file(filePath);

          links.push(new vscode.DocumentLink(range, targetUri));
        }
      };

      processMatches(importRegex);
      processMatches(loadRegex);

      return links;
    }
  };
};
