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
const k8s_operator_1 = __importStar(require("@dot-i/k8s-operator"));
const cron = require('node-cron');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
class MyOperator extends k8s_operator_1.default {
    async init() {
        await this.watchResource('stable.marvfadev.me', 'v1', 'prints', async (e) => {
            var _a;
            const object = e.object;
            const path = (_a = object.spec) === null || _a === void 0 ? void 0 : _a.path;
            switch (e.type) {
                case k8s_operator_1.ResourceEventType.Added:
                    try {
                        cron.schedule('*/10 * * * * *', () => {
                            k8sApi.listPodForAllNamespaces().then((res) => {
                                res.body.items.forEach(async (item) => {
                                    var _a;
                                    var today = new Date().toLocaleString();
                                    var data = 'Date: ' + today + ' - ' + ((_a = item.metadata) === null || _a === void 0 ? void 0 : _a.name);
                                    await fs.appendFile(path, data + '\n', function (err) {
                                        var _a;
                                        if (err)
                                            throw err;
                                        console.log('Date: ' + today + ' - ' + ((_a = item.metadata) === null || _a === void 0 ? void 0 : _a.name));
                                    });
                                });
                            });
                        });
                    }
                    catch (error) {
                        console.log(error);
                    }
                    break;
                case k8s_operator_1.ResourceEventType.Modified:
                    // do something useful here
                    break;
                case k8s_operator_1.ResourceEventType.Deleted:
                    // do something useful here
                    break;
            }
        });
    }
}
exports.default = MyOperator;
async function main() {
    const operator = new MyOperator();
    await operator.start();
    const exit = (reason) => {
        operator.stop();
        process.exit(0);
    };
    process.on('SIGTERM', () => exit('SIGTERM')).on('SIGINT', () => exit('SIGINT'));
}
main();
//# sourceMappingURL=index.js.map