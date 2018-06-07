'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const vscode_1 = require("vscode");
const completion = require("./completion");
const formatting = require("./formatting");
const listEditing = require("./listEditing");
const preview = require("./preview");
const print = require("./print");
const tableFormatter = require("./tableFormatter");
const toc = require("./toc");
const util_1 = require("./util");
function activate(context) {
    activateMdExt(context);
    return {
        extendMarkdownIt(md) {
            return md.use(require('markdown-it-task-lists'))
                .use(require('@iktakahiro/markdown-it-katex'));
        }
    };
}
exports.activate = activate;
function activateMdExt(context) {
    // Override `Enter`, `Tab` and `Backspace` keys
    listEditing.activate(context);
    // Shortcuts
    formatting.activate(context);
    // Toc
    toc.activate(context);
    // Images paths and math commands completions
    completion.activate(context);
    // Print to PDF
    print.activate(context);
    // Table formatter
    if (vscode_1.workspace.getConfiguration('markdown.extension.tableFormatter').get('enabled')) {
        tableFormatter.activate(context);
    }
    // Auto show preview to side
    preview.activate(context);
    // Allow `*` in word pattern for quick styling
    vscode_1.languages.setLanguageConfiguration('markdown', {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\!\@\#\%\^\&\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s\，\。\《\》\？\；\：\‘\“\’\”\（\）\【\】\、]+)/g
    });
    newVersionMessage(context.extensionPath);
}
function newVersionMessage(extensionPath) {
    let data, currentVersion;
    try {
        data = fs.readFileSync(`${extensionPath}${path.sep}package.json`).toString();
        currentVersion = JSON.parse(data).version;
        if (fs.existsSync(`${extensionPath}${path.sep}VERSION`) &&
            fs.readFileSync(`${extensionPath}${path.sep}VERSION`).toString() === currentVersion) {
            return;
        }
        fs.writeFileSync(`${extensionPath}${path.sep}VERSION`, currentVersion);
    }
    catch (error) {
        console.log(error);
        return;
    }
    const featureMsg = util_1.getNewFeatureMsg(currentVersion);
    if (featureMsg === undefined)
        return;
    vscode_1.window.showInformationMessage(featureMsg, 'See Pictures', 'Dismiss').then(option => {
        switch (option) {
            case 'See Pictures':
                util_1.showChangelog();
            case 'Dismiss':
                break;
        }
    });
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map