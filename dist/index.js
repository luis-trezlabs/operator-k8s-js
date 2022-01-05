"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const k8s = __importStar(require("@kubernetes/client-node"));
const fs = __importStar(require("fs"));
const kc = new k8s.KubeConfig();
// kc.loadFromDefault();
kc.loadFromCluster();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const path = '/usr/share/pod-logs/';
const filename = process.env.FILENAME ? process.env.FILENAME + '.txt' : 'pod-logs.txt';
const fullPath = path + filename;
try {
    fs.mkdir(path, { recursive: true }, async (err) => {
        if (err)
            throw err;
        k8sApi.listPodForAllNamespaces().then(async (res) => {
            console.log("Time \t\t\t Pod Name");
            await fs.appendFile(fullPath, `-------------------------\nTime \t\t\t Pod Name\n`, function (err) {
                if (err)
                    throw err;
            });
            // Print in console the current time and pods names
            var today = new Date().toLocaleString();
            res.body.items.forEach(async (element) => {
                var _a, _b;
                console.log(today + '\t' + ((_a = element.metadata) === null || _a === void 0 ? void 0 : _a.name));
                await fs.appendFile(fullPath, today + '\t' + ((_b = element.metadata) === null || _b === void 0 ? void 0 : _b.name) + '\n', function (err) {
                    if (err)
                        throw err;
                });
            });
            console.log('\nTask Executed Successfully!');
            console.log('\nBye!');
        });
    });
}
catch (error) {
    console.log(error);
}
//# sourceMappingURL=index.js.map