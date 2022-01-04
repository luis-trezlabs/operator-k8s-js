import Operator from '@dot-i/k8s-operator';
import * as k8s from '@kubernetes/client-node';


const kc = new k8s.KubeConfig();

// kc.loadFromDefault();
kc.loadFromCluster();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);


// To implement your operator and watch one or more resources, create a sub-class from Operator.
export default class PodNamesOperator extends Operator {
    protected async init() {
        this.kubeConfig.loadFromCluster();

        await this.watchResource('stable.luisbodev.me', 'v1', 'operatorpodnames', async (e) => {
            k8sApi.listPodForAllNamespaces().then((res: { body: any }) => {

                // Print in console the current time and pods names
                console.log("Time \t\t\t Pod Name");
                res.body.items.forEach((element: any) => {
                    var today = new Date().toLocaleString();

                    console.log(today + '\t' +element.metadata?.name);
                });
                console.log('\nTask Executed Successfully!')
                console.log('\nBye!')
                this.stop();
                process.exit(0);
            })
        });
    }
}

async function start() {
    const operator = new PodNamesOperator();
    await operator.start();

    const exit = (reason: string) => {
        console.log('\nBye!')
        operator.stop();
        process.exit(0);
    };

    process.on('SIGTERM', () => exit('SIGTERM'))
        .on('SIGINT', () => exit('SIGINT'));
}

start();