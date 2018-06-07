'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand('markdown.extension.onEnterKey', onEnterKey), vscode_1.commands.registerCommand('markdown.extension.onCtrlEnterKey', () => { onEnterKey('ctrl'); }), vscode_1.commands.registerCommand('markdown.extension.onTabKey', onTabKey), vscode_1.commands.registerCommand('markdown.extension.onBackspaceKey', onBackspaceKey), vscode_1.commands.registerCommand('markdown.extension.checkTaskList', checkTaskList), vscode_1.commands.registerCommand('markdown.extension.onMoveLineDown', onMoveLineDown), vscode_1.commands.registerCommand('markdown.extension.onMoveLineUp', onMoveLineUp));
}
exports.activate = activate;
function isInFencedCodeBlock(doc, lineNum) {
    let textBefore = doc.getText(new vscode_1.Range(new vscode_1.Position(0, 0), new vscode_1.Position(lineNum, 0)));
    let matches = textBefore.match(/```.*\r?\n/g);
    if (matches == null) {
        return false;
    }
    else {
        return matches.length % 2 != 0;
    }
}
function onEnterKey(modifiers) {
    let editor = vscode_1.window.activeTextEditor;
    let cursorPos = editor.selection.active;
    let line = editor.document.lineAt(cursorPos.line);
    let textBeforeCursor = line.text.substr(0, cursorPos.character);
    let textAfterCursor = line.text.substr(cursorPos.character);
    let lineBreakPos = cursorPos;
    if (modifiers == 'ctrl') {
        lineBreakPos = line.range.end;
    }
    if (isInFencedCodeBlock(editor.document, cursorPos.line)) {
        return asNormal('enter', modifiers);
    }
    // If it's an empty list item, remove it
    if (/^(>|([-+*]|[0-9]+[.)])(| \[[ x]\]))$/.test(textBeforeCursor.trim()) && textAfterCursor.trim().length == 0) {
        return editor.edit(editBuilder => {
            editBuilder.delete(line.range);
            editBuilder.insert(line.range.end, '\n');
        });
    }
    let matches;
    if (/^> /.test(textBeforeCursor)) {
        // Quote block
        return editor.edit(editBuilder => {
            editBuilder.insert(lineBreakPos, `\n> `);
        }).then(() => {
            // Fix cursor position
            if (modifiers == 'ctrl' && !cursorPos.isEqual(lineBreakPos)) {
                let newCursorPos = cursorPos.with(line.lineNumber + 1, 2);
                editor.selection = new vscode_1.Selection(newCursorPos, newCursorPos);
            }
        }).then(() => { editor.revealRange(editor.selection); });
    }
    else if ((matches = /^(\s*[-+*] +(|\[[ x]\] +))(?!\[[ x]\]).*$/.exec(textBeforeCursor)) !== null) {
        // Unordered list
        return editor.edit(editBuilder => {
            editBuilder.insert(lineBreakPos, `\n${matches[1].replace('[x]', '[ ]')}`);
        }).then(() => {
            // Fix cursor position
            if (modifiers == 'ctrl' && !cursorPos.isEqual(lineBreakPos)) {
                let newCursorPos = cursorPos.with(line.lineNumber + 1, matches[1].length);
                editor.selection = new vscode_1.Selection(newCursorPos, newCursorPos);
            }
        }).then(() => { editor.revealRange(editor.selection); });
    }
    else if ((matches = /^(\s*)([0-9]+)([.)])( +)(|\[[ x]\] +)(?!\[[ x]\]).*$/.exec(textBeforeCursor)) !== null) {
        // Ordered list
        let config = vscode_1.workspace.getConfiguration('markdown.extension.orderedList').get('marker');
        let marker = '1';
        let leadingSpace = matches[1];
        let previousMarker = matches[2];
        let delimiter = matches[3];
        let trailingSpace = matches[4];
        let gfmCheckbox = matches[5].replace('[x]', '[ ]');
        let textIndent = (previousMarker + delimiter + trailingSpace).length;
        if (config == 'ordered') {
            marker = String(Number(previousMarker) + 1);
        }
        // Add enough trailing spaces so that the text is aligned with the previous list item, but always keep at least one space
        trailingSpace = " ".repeat(Math.max(1, textIndent - (marker + delimiter).length));
        const toBeAdded = leadingSpace + marker + delimiter + trailingSpace + gfmCheckbox;
        return editor.edit(editBuilder => {
            editBuilder.insert(lineBreakPos, `\n${toBeAdded}`);
        }, { undoStopBefore: true, undoStopAfter: false }).then(() => {
            // Fix cursor position
            if (modifiers == 'ctrl' && !cursorPos.isEqual(lineBreakPos)) {
                let newCursorPos = cursorPos.with(line.lineNumber + 1, toBeAdded.length);
                editor.selection = new vscode_1.Selection(newCursorPos, newCursorPos);
            }
        }).then(() => fixMarker()).then(() => { editor.revealRange(editor.selection); });
    }
    else {
        return asNormal('enter', modifiers);
    }
}
function onTabKey() {
    let editor = vscode_1.window.activeTextEditor;
    let cursorPos = editor.selection.active;
    let textBeforeCursor = editor.document.lineAt(cursorPos.line).text.substr(0, cursorPos.character);
    if (isInFencedCodeBlock(editor.document, cursorPos.line)) {
        return asNormal('tab');
    }
    if (/^\s*([-+*]|[0-9]+[.)]) +(|\[[ x]\] +)$/.test(textBeforeCursor)) {
        return vscode_1.commands.executeCommand('editor.action.indentLines').then(() => fixMarker());
    }
    else {
        return asNormal('tab');
    }
}
function onBackspaceKey() {
    let editor = vscode_1.window.activeTextEditor;
    let cursor = editor.selection.active;
    let document = editor.document;
    let textBeforeCursor = document.lineAt(cursor.line).text.substr(0, cursor.character);
    if (isInFencedCodeBlock(document, cursor.line)) {
        return asNormal('backspace');
    }
    if (/^\s+([-+*]|[0-9]+[.)]) (|\[[ x]\] )$/.test(textBeforeCursor)) {
        return vscode_1.commands.executeCommand('editor.action.outdentLines').then(() => fixMarker());
    }
    else if (/^([-+*]|[0-9]+[.)]) $/.test(textBeforeCursor)) {
        // e.g. textBeforeCursor == '- ', '1. '
        return deleteRange(editor, new vscode_1.Range(cursor.with({ character: 0 }), cursor)).then(() => fixMarker(cursor.line + 1));
    }
    else if (/^([-+*]|[0-9]+[.)]) (\[[ x]\] )$/.test(textBeforeCursor)) {
        // e.g. textBeforeCursor == '- [ ]', '1. [x]'
        return deleteRange(editor, new vscode_1.Range(cursor.with({ character: textBeforeCursor.length - 4 }), cursor)).then(() => fixMarker(cursor.line + 1));
    }
    else {
        return asNormal('backspace').then(() => fixMarker());
    }
}
function asNormal(key, modifiers) {
    switch (key) {
        case 'enter':
            if (modifiers === 'ctrl') {
                return vscode_1.commands.executeCommand('editor.action.insertLineAfter');
            }
            else {
                return vscode_1.commands.executeCommand('type', { source: 'keyboard', text: '\n' });
            }
        case 'tab':
            if (vscode_1.workspace.getConfiguration('emmet').get('triggerExpansionOnTab')) {
                return vscode_1.commands.executeCommand('editor.emmet.action.expandAbbreviation');
            }
            else {
                return vscode_1.commands.executeCommand('tab');
            }
        case 'backspace':
            return vscode_1.commands.executeCommand('deleteLeft');
    }
}
function lookUpwardForMarker(editor, line, numOfSpaces) {
    let orderedListRegex = /^(\s*)([0-9]+)[.)] +(?:|\[[x]\] +)(?!\[[x]\]).*$/;
    while (--line >= 0) {
        let matches;
        const lineText = editor.document.lineAt(line).text;
        if ((matches = orderedListRegex.exec(lineText)) !== null) {
            if (matches[1].length === numOfSpaces) {
                return Number(matches[2]) + 1;
            }
            else if ((editor.options.insertSpaces && matches[1].length + editor.options.tabSize <= numOfSpaces)
                || !editor.options.insertSpaces && matches[1].length + 1 <= numOfSpaces) {
                return 1;
            }
        }
        else if (!lineText.startsWith(' ') && !lineText.startsWith('\\t')) {
            break;
        }
    }
    return 1;
}
/**
 * Fix ordered list marker *iteratively* starting from current line
 */
function fixMarker(line) {
    let editor = vscode.window.activeTextEditor;
    if (line === undefined) {
        line = editor.selection.active.line;
    }
    if (line < 0 || editor.document.lineCount <= line) {
        return editor.edit(() => { }, { undoStopBefore: false, undoStopAfter: true });
    }
    let currentLineText = editor.document.lineAt(line).text;
    if (/^(\s*[-+*] +(|\[[ x]\] +))(?!\[[ x]\]).*$/.test(currentLineText) // unordered list
        || vscode_1.workspace.getConfiguration('markdown.extension.orderedList').get('marker') == 'one') {
        return editor.edit(() => { }, { undoStopBefore: false, undoStopAfter: true });
    }
    else {
        let matches;
        if ((matches = /^(\s*)([0-9]+)[.)] +(?:|\[[x]\] +)(?!\[[x]\]).*$/.exec(currentLineText)) !== null) {
            let leadingSpace = matches[1];
            let marker = matches[2];
            let fixedMarker = lookUpwardForMarker(editor, line, leadingSpace.length);
            return editor.edit(editBuilder => {
                if (Number(marker) === fixedMarker)
                    return;
                editBuilder.replace(new vscode_1.Range(line, leadingSpace.length, line, leadingSpace.length + marker.length), String(fixedMarker));
            }, { undoStopBefore: false, undoStopAfter: false }).then(() => {
                let nextLine = line + 1;
                while (editor.document.lineCount > nextLine) {
                    const nextLineText = editor.document.lineAt(nextLine).text;
                    if (/^(\s*)([0-9]+)[.)] +(?:|\[[x]\] +)(?!\[[x]\]).*$/.test(nextLineText)) {
                        return fixMarker(nextLine);
                    }
                    else if (nextLineText.startsWith(leadingSpace) && /[ \t]/.test(nextLineText.charAt(leadingSpace.length))) {
                        nextLine++;
                    }
                    else {
                        return editor.edit(() => { }, { undoStopBefore: false, undoStopAfter: true });
                    }
                }
            });
        }
        else {
            return editor.edit(() => { }, { undoStopBefore: false, undoStopAfter: true });
        }
    }
}
function deleteRange(editor, range) {
    return editor.edit(editBuilder => {
        editBuilder.delete(range);
    });
}
function checkTaskList() {
    let editor = vscode_1.window.activeTextEditor;
    let cursorPos = editor.selection.active;
    let line = editor.document.lineAt(cursorPos.line).text;
    let matches;
    if (matches = /^(\s*([-+*]|[0-9]+[.)]) \[) \]/.exec(line)) {
        return editor.edit(editBuilder => {
            editBuilder.replace(new vscode_1.Range(cursorPos.with({ character: matches[1].length }), cursorPos.with({ character: matches[1].length + 1 })), 'x');
        });
    }
    else if (matches = /^(\s*([-+*]|[0-9]+[.)]) \[)x\]/.exec(line)) {
        return editor.edit(editBuilder => {
            editBuilder.replace(new vscode_1.Range(cursorPos.with({ character: matches[1].length }), cursorPos.with({ character: matches[1].length + 1 })), ' ');
        });
    }
}
function onMoveLineUp() {
    return vscode_1.commands.executeCommand('editor.action.moveLinesUpAction')
        .then(() => fixMarker());
}
function onMoveLineDown() {
    return vscode_1.commands.executeCommand('editor.action.moveLinesDownAction')
        .then(() => fixMarker(vscode.window.activeTextEditor.selection.active.line - 1));
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=listEditing.js.map