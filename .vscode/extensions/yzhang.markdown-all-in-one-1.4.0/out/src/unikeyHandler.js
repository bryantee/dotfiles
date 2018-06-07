'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
//Vietnamese characters regex
exports.vnRegex = /[\u00C0-\u00C3\u00C8-\u00CA\u00CC\u00CD\u00D2-\u00D5\u00D9\u00DA\u00DD\u00E0-\u00E3\u00E8-\u00EA\u00EC\u00ED\u00F2-\u00F5\u00F9\u00FA\u00FD\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01A0\u01A1\u01AF\u01B0\u1EA0-\u1EF9]/;
let countDown = 0; // Repeated calls countdown.
let deleteCounter = 0; // For countup testing.
// Include inserted Vietnamese characters
function vnTest() {
    return __awaiter(this, void 0, void 0, function* () {
        // Move cursor for updating editor.
        yield vscode_1.commands.executeCommand('cursorMove', { to: 'right', value: 1 });
        yield vscode_1.commands.executeCommand('cursorUndo');
        let cursorPosition = vscode_1.window.activeTextEditor.selection.active;
        return exports.vnRegex.test(vscode_1.window.activeTextEditor.document.lineAt(cursorPosition.line).text.charAt(cursorPosition.character));
    });
}
exports.vnTest = vnTest;
function handleUnikey(repeatNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        if (countDown == 0) {
            countDown = repeatNumber < 0 ? 0 : repeatNumber;
        }
        countDown--;
        if (countDown == 0) {
            return true; // Ok to run delete function.
        }
        else {
            if (countDown < 0) {
                countDown = 0;
            }
            return false; // Still have repeated calls.
        }
    });
}
exports.handleUnikey = handleUnikey;
//# sourceMappingURL=unikeyHandler.js.map