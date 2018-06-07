'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode_1 = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider({ scheme: 'file', language: 'markdown' }, new MdCompletionItemProvider(), '(', '\\', '/'));
}
exports.activate = activate;
class MdCompletionItemProvider {
    constructor() {
        this.accents = ['bar', 'hat', 'widehat', 'tilde', 'widetilde', 'vec', 'overline', 'underline'];
        this.delimeterSizing = ['left', 'middle', 'right', 'big', 'Big'];
        this.greekLetters = ['Gamma', 'Delta', 'Theta', 'Lambda', 'Pi', 'Sigma', 'Phi', 'Psi', 'Omega', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'varepsilon', 'varphi'];
        this.otherLetters = ['ell', 'Re', 'nabla'];
        this.logicAndSetTheory = ['forall', 'exists', 'in', 'notin', 'subset', 'supset', 'mid', 'land', 'lor', 'neg', 'therefore', 'because', 'mapsto', 'to', 'gets', 'leftrightarrow', 'implies', 'impliedby', 'iff'];
        this.bigOperators = ['sum', 'prod', 'int'];
        this.binaryOperators = ['cdot', 'times'];
        this.fractions = ['frac'];
        this.mathOperaters = ['sin', 'cos', 'exp', 'tan', 'tanh', 'ln', 'lg', 'log', 'det', 'inf', 'lim', 'max', 'min', 'Pr', 'sup']; // plus \operatorname{...}
        this.sqrt = ['sqrt'];
        this.relations = ['coloneq', 'equiv', 'ge', 'gt', 'gg', 'le', 'lt', 'll', 'prec', 'succ', 'sim', 'simeq', 'ne']; // including negated relations
        this.font = ['rm', 'bf', 'it', 'sf', 'tt', 'mathrm', 'mathbf', 'mathit', 'mathsf', 'mathtt', 'mathbb', 'mathcal', 'mathscr', 'mathfrak'];
        this.size = ['Huge', 'huge', 'LARGE', 'Large', 'large', 'normalsize', 'small', 'footnotesize', 'scriptsize', 'tiny'];
        this.symbolsAndPunctuation = ['dots', 'cdots', 'ddots', 'ldots', 'vdots', 'checkmark', 'infty'];
        // \cmd
        let c1 = [...this.delimeterSizing, ...this.greekLetters, ...this.otherLetters, ...this.logicAndSetTheory, ...this.bigOperators, ...this.binaryOperators, ...this.mathOperaters, ...this.relations, ...this.size, ...this.symbolsAndPunctuation].map(cmd => {
            let item = new vscode_1.CompletionItem('\\' + cmd, vscode_1.CompletionItemKind.Function);
            item.insertText = cmd;
            return item;
        });
        // \cmd{$0}
        let c2 = [...this.accents, ...this.sqrt, ...this.font, 'operatorname'].map(cmd => {
            let item = new vscode_1.CompletionItem('\\' + cmd, vscode_1.CompletionItemKind.Function);
            item.insertText = new vscode_1.SnippetString(`${cmd}\{$0\}`);
            return item;
        });
        // \cmd{$1}{$2}
        let c3 = this.fractions.map(cmd => {
            let item = new vscode_1.CompletionItem('\\' + cmd, vscode_1.CompletionItemKind.Function);
            item.insertText = new vscode_1.SnippetString(`${cmd}\{$1\}\{$2\}`);
            return item;
        });
        let envSnippet = new vscode_1.CompletionItem('\\begin', vscode_1.CompletionItemKind.Snippet);
        envSnippet.insertText = new vscode_1.SnippetString('begin{${1|aligned,array,bmatrix,Bmatrix,cases,gathered,matrix,pmatrix,vmatrix,Vmatrix|}}\n\t$0\n\\end{$1}');
        this.mathCompletions = Array.from(new Set([...c1, ...c2, ...c3, envSnippet]));
    }
    provideCompletionItems(document, position, token, context) {
        if (vscode_1.workspace.getWorkspaceFolder(document.uri) === undefined)
            return [];
        let textBefore = document.lineAt(position.line).text.substring(0, position.character);
        let matches;
        if (/!\[[^\]]*?\]\([^\)]*$/.test(textBefore)) {
            // Complete image paths
            matches = textBefore.match(/!\[[^\]]*?\]\(([^\)]*?)[\\\/]?[^\\\/\)]*$/);
            let dir = matches[1].replace(/\\/g, '/');
            return vscode_1.workspace.findFiles((dir.length == 0 ? '' : dir + '/') + '**/*.{png,jpg,jpeg,svg,gif}', '**/node_modules/**').then(uris => uris.map(uri => {
                let relPath = path.relative(path.join(vscode_1.workspace.getWorkspaceFolder(uri).uri.fsPath, dir), uri.fsPath);
                relPath.replace(/\\/g, '/');
                return new vscode_1.CompletionItem(relPath, vscode_1.CompletionItemKind.File);
            }));
        }
        else if (/(^|[^\$])\$(|[^ \$].*)\\\w*$/.test(textBefore)) {
            // Complete math functions (inline math)
            return this.mathCompletions;
        }
        else if ((matches = document.getText(new vscode_1.Range(new vscode_1.Position(0, 0), position)).match(/\$\$/g)) !== null && matches.length % 2 !== 0) {
            // Complete math functions
            return this.mathCompletions;
        }
        else {
            return [];
        }
    }
}
//# sourceMappingURL=completion.js.map