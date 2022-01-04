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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const k8s_operator_1 = __importDefault(require("@dot-i/k8s-operator"));
const k8s = __importStar(require("@kubernetes/client-node"));
const kc = new k8s.KubeConfig();
// kc.loadFromDefault();
kc.loadFromCluster();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
// To implement your operator and watch one or more resources, create a sub-class from Operator.
class PodNamesOperator extends k8s_operator_1.default {
    async init() {
        this.kubeConfig.loadFromCluster();
        await this.watchResource('stable.luisbodev.me', 'v1', 'operatorpodnames', async (e) => {
            k8sApi.listPodForAllNamespaces().then((res) => {
                // Print in console the current time and pods names
                console.log("Time \t\t\t Pod Name");
                res.body.items.forEach((element) => {
                    var _a;
                    var today = new Date().toLocaleString();
                    console.log(today + '\t' + ((_a = element.metadata) === null || _a === void 0 ? void 0 : _a.name));
                });
            });
        });
    }
}
exports.default = PodNamesOperator;
async function start() {
    const operator = new PodNamesOperator();
    await operator.start();
    const exit = (reason) => {
        console.log('\nBye!');
        operator.stop();
        process.exit(0);
    };
    process.on('SIGTERM', () => exit('SIGTERM'))
        .on('SIGINT', () => exit('SIGINT'));
}
start();
//# sourceMappingURL=index.js.map