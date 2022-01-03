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
//Loading kubeconfig context from default/ cluster
kc.loadFromCluster();
// Declaring api client for the coreV1Api export of the typescript client
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
//Where we are going to save the node-cron schedule, with a custom string key
var scheduledPrints = {};
class MyOperator extends k8s_operator_1.default {
    async init() {
        //Setting my kubeconfig to be loaded from the cluster and not from default on the operator-node module
        this.kubeConfig.loadFromCluster();
        console.info('Watching for Print CRD to be created. Pls create one...');
        //Watching the CRD using the watchresource method from the library, that callbacks with an event object with
        //The resource data, the event type
        //This methods 'keeps alive the watching until the stop method of the instance is called
        await this.watchResource('stable.marvfadev.me', 'v1', 'prints', async (e) => {
            var _a, _b, _c, _d, _e;
            //Telling the compiler that the object should be treated as a Print resource Type
            //if not, it will not recognize the spec fields
            const object = e.object;
            //Getting or interests values from the yaml file
            const path = `/usr/share/prints/${((_a = object.spec) === null || _a === void 0 ? void 0 : _a.path) || ''}${(_b = object.spec) === null || _b === void 0 ? void 0 : _b.filename}.txt` ||
                '/usr/share/prints/pods.txt';
            const schedule = ((_c = object.spec) === null || _c === void 0 ? void 0 : _c.schedule) || '*/10 * * * * *';
            const name = ((_d = object.metadata) === null || _d === void 0 ? void 0 : _d.name) || 'print-sample';
            //Switching the event type
            switch (e.type) {
                case k8s_operator_1.ResourceEventType.Added:
                    try {
                        //Creating the directory  with the recursive option in case that the
                        //path already exists
                        fs.mkdir(`/usr/share/prints/${((_e = object.spec) === null || _e === void 0 ? void 0 : _e.path) || ''}`, { recursive: true }, (err) => {
                            if (err) {
                                return console.error(err);
                            }
                            console.log('Directory ' + path + ' created successfully!');
                            //Creating the schedule task, but without actually starting to run.
                            //It uses the CR name as a key for identifying it and for a posterior stopping.
                            scheduledPrints[name] = cron.schedule(schedule, () => {
                                //Listing all the pods using the k8s api client for js
                                k8sApi.listPodForAllNamespaces().then(async (res) => {
                                    var today = new Date().toLocaleString();
                                    //Apending to a file using the path from the yaml
                                    await fs.appendFile(path, `--------------\n From Print: ${name} - Date: ${today} \n---------------\n`, (err) => {
                                        if (err)
                                            throw err;
                                    });
                                    //Getting the items of the client response and appending to the file
                                    console.log(`New Print to ${path} at: ${today}`);
                                    res.body.items.forEach(async (item) => {
                                        var _a;
                                        var data = (_a = item.metadata) === null || _a === void 0 ? void 0 : _a.name;
                                        await fs.appendFile(path, data + '\n', function (err) {
                                            if (err)
                                                throw err;
                                        });
                                    });
                                });
                            }, {
                                scheduled: false,
                            });
                            //Starting the saved schedule
                            scheduledPrints[name].start();
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
}
main();
//# sourceMappingURL=index.js.map