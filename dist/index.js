"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PrintOperator_1 = __importDefault(require("./PrintOperator"));
//self invoked async function
(async () => {
    const operator = new PrintOperator_1.default();
    //This is just await for the init() function implemented on the instance MyOPerator.
    await operator.start();
    const exit = (reason) => {
        //Aborting each watch request.
        operator.stop();
        // Terminating the nodejs process with 'success' code 0
        console.log(reason);
        process.exit(0);
    };
    //calling exit when the terminal is closed.
    process.on('SIGTERM', () => exit('SIGTERM')).on('SIGINT', () => exit('SIGINT'));
})();
//# sourceMappingURL=index.js.map