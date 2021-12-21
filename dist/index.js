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
const k8s = require('@kubernetes/client-node');
const cron = require('node-cron');
const fs = require('fs');
//Creating new instance of the kubeconfig class from the api to access methods
const kc = new k8s.KubeConfig();
//Loading kubeconfig context from default
kc.loadFromDefault();
// Declaring api client for the v1 kubernetes api
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
//Where we are going to save the node-cron schedule, with a custom string key
var scheduledPrints = {};
class MyOperator extends k8s_operator_1.default {
    async init() {
        //Watching the CRD using the watchresource method from the library, that callbacks with an event object with
        //The resource data, the event type 
        await this.watchResource('stable.marvfadev.me', 'v1', 'prints', async (e) => {
            var _a, _b, _c;
            //Telling the compiler that the object should be treated as a Print resource Type
            //if not, it will not recognize the spec fields
            const object = e.object;
            //Getting or interests values from the yaml file
            const path = ((_a = object.spec) === null || _a === void 0 ? void 0 : _a.path) || 'pods.txt';
            const schedule = ((_b = object.spec) === null || _b === void 0 ? void 0 : _b.schedule) || '*/8 * * * * *';
            const name = ((_c = object.metadata) === null || _c === void 0 ? void 0 : _c.name) || 'print-sample';
            //Switching the event type
            switch (e.type) {
                case k8s_operator_1.ResourceEventType.Added:
                    try {
                        //Creating the schedule task, but without actually starting to run.
                        //It uses the CR name as a key for identifying it and for a posterior stopping.
                        scheduledPrints[name] = cron.schedule(schedule, () => {
                            //Listing all the pods using the k8s api client for js
                            k8sApi.listPodForAllNamespaces().then(async (res) => {
                                var today = new Date().toLocaleString();
                                //Apending to a file
                                await fs.appendFile(path, '--------------\n From printer:' + name + ' - Pods at ' + today + '\n---------------\n', (err) => {
                                    if (err)
                                        throw err;
                                });
                                //Getting the items of the client response and appending to the file
                                res.body.items.forEach(async (item) => {
                                    var _a;
                                    var data = (_a = item.metadata) === null || _a === void 0 ? void 0 : _a.name;
                                    await fs.appendFile(path, data + '\n', function (err) {
                                        var _a;
                                        if (err)
                                            throw err;
                                        console.log('Date: ' + today + ' - ' + ((_a = item.metadata) === null || _a === void 0 ? void 0 : _a.name));
                                    });
                                });
                            });
                        }, {
                            scheduled: false
                        });
                        //Starting the saved schedule
                        scheduledPrints[name].start();
                    }
                    catch (error) {
                        console.log(error);
                    }
                    break;
                case k8s_operator_1.ResourceEventType.Modified:
                    // do something useful here
                    break;
                case k8s_operator_1.ResourceEventType.Deleted:
                    try {
                        //If we delete the print resource, we should stop the node-cron task.
                        scheduledPrints[name].stop();
                    }
                    catch (error) {
                        console.log(error);
                    }
                    break;
            }
        });
    }
}
exports.default = MyOperator;
async function main() {
    const operator = new MyOperator();
    //This is just await for the init.
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
}
main();
//# sourceMappingURL=index.js.map