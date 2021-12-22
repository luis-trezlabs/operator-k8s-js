import Operator, { ResourceEventType, ResourceEvent } from '@dot-i/k8s-operator'
import { KubernetesObject } from '@kubernetes/client-node'

const k8s = require('@kubernetes/client-node')
const cron = require('node-cron');
const fs = require('fs')
//Creating new instance of the kubeconfig class from the api to access methods
const kc = new k8s.KubeConfig()
//Loading kubeconfig context from default/ cluster
kc.loadFromCluster()
// Declaring api client for the v1 kubernetes api
const k8sApi = kc.makeApiClient(k8s.CoreV1Api)

//To reference a kubernetes object with that specific specs fields
export interface PrintResource extends KubernetesObject {
    spec: PrintResourceSpec;
}

export interface PrintResourceSpec {
    path: string
    schedule: string
    filename: string
}

//Where we are going to save the node-cron schedule, with a custom string key
var scheduledPrints: {[key:string]:any} = {};  

export default class MyOperator extends Operator {
    protected async init() {
        //Setting my kubeconfig to be loaded from the cluster and not from default on the operator-node module
        this.kubeConfig.loadFromCluster();

        console.info('Watching for Print CRD to be created. Pls create one...')
        //Watching the CRD using the watchresource method from the library, that callbacks with an event object with
        //The resource data, the event type 
        await this.watchResource('stable.marvfadev.me', 'v1', 'prints', async (e) => {
            //Telling the compiler that the object should be treated as a Print resource Type
            //if not, it will not recognize the spec fields
            const object = e.object as PrintResource
            //Getting or interests values from the yaml file
            const path = `/usr/share/prints/${object.spec?.path || '' }/${object.spec?.filename}.txt` || '/usr/share/prints/pods.txt'
            const schedule = object.spec?.schedule || '*/8 * * * * *'
            const name = object.metadata?.name || 'print-sample'

            //Switching the event type
            switch (e.type) {
                case ResourceEventType.Added:
                    try {
                        //Creating the schedule task, but without actually starting to run.
                        //It uses the CR name as a key for identifying it and for a posterior stopping.
                        scheduledPrints[name] = cron.schedule(schedule, () => {
                            //Listing all the pods using the k8s api client for js
                            k8sApi.listPodForAllNamespaces().then(async (res: { body: any }) => {
                                var today = new Date().toLocaleString()
                                //Apending to a file
                                await fs.appendFile(
                                    path,
                                    '--------------\n From printer:' + name + ' - Pods at ' + today + '\n---------------\n',
                                    (err: any) => {
                                        if (err) throw err
                                    }
                                )
                                //Getting the items of the client response and appending to the file
                                res.body.items.forEach(async (item: any) => {
                                    var data = item.metadata?.name
            
                                    await fs.appendFile(path, data + '\n', function (err: any) {
                                        if (err) throw err
                                        console.log('Date: ' + today + ' - ' + item.metadata?.name)
                                    })
                                })
                            })
                        },  {
                            scheduled: false
                        })

                        //Starting the saved schedule
                        scheduledPrints[name].start();
                       
                    } catch (error) {
                        console.log(error)
                    }

                    break
                case ResourceEventType.Modified:
                    // do something useful here
                    break
                case ResourceEventType.Deleted:
                    try {
                        //If we delete the print resource, we should stop the node-cron task.
                        scheduledPrints[name].stop();
                    }catch(error){
                        console.log(error)
                    }
       
                    break
            }
        })
    }
}

async function main() {
    const operator = new MyOperator()
    //This is just await for the init.
    await operator.start()


    const exit = (reason: string) => {
        //Aborting each watch request.
        operator.stop()
        // Terminating the nodejs process with 'success' code 0 
        console.log(reason)
        process.exit(0)
    }

    //calling exit when the terminal is closed.
    process.on('SIGTERM', () => exit('SIGTERM')).on('SIGINT', () => exit('SIGINT'))
}

main()
