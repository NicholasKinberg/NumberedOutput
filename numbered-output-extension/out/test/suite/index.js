"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const path = require("path");
const Mocha = require("mocha");
const glob_1 = require("glob");
async function run() {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000
    });
    const testsRoot = path.resolve(__dirname, '..');
    try {
        const files = await (0, glob_1.glob)('**/**.test.js', { cwd: testsRoot });
        // Add files to the test suite
        files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));
        // Run the mocha test
        return new Promise((resolve, reject) => {
            mocha.run((failures) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                }
                else {
                    resolve();
                }
            });
        });
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
exports.run = run;
//# sourceMappingURL=index.js.map