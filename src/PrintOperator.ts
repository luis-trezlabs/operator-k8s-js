import Operator, { ResourceEventType, ResourceEvent } from '@dot-i/k8s-operator'
import { KubernetesObject } from '@kubernetes/client-node'
const cron = require('node-cron')
const fs = require('fs')

//To reference a kubernetes object with that specific specs fields
export interface PrintResource extends KubernetesObject {
    spec: PrintResourceSpec
}

export interface PrintResourceSpec {
    path: string
    schedule: string
    filename: string
}

//Where we are going to save the node-cron schedule, with a custom string key
var scheduledPrints: { [key: string]: any } = {}

export default class PrintOperator extends Operator {
    protected async init() {
        //Setting my kubeconfig to be loaded from the cluster and not from default on the operator-node module
        this.kubeConfig.loadFromCluster()

        console.info('Watching for Print Resource to be created. Pls create one...')
        //Watching the CRD using the watchresource method from the library, that callbacks with an event object with
        //The resource data, the event type
        //This methods 'keeps alive the watching until the stop method of the instance is called
        await this.watchResource('stable.marvfadev.me', 'v1', 'prints', async (e) => {
            //Telling the compiler that the object should be treated as a Print resource Type
            //if not, it will not recognize the spec fields
            const object = e.object as PrintResource

            //Getting or interests values from the yaml file
            const path = `/usr/share/prints/${object.spec?.path || ''}${object.spec?.filename || 'pods'}.txt`
            const schedule = object.spec?.schedule || '*/10 * * * * *'
            const name = object.metadata?.name || 'print-sample'

            //Switching the event type
            switch (e.type) {
                case ResourceEventType.Added:
                    try {
                        //Creating the directory  with the recursive option in case that the
                        //path already exists
                        fs.mkdir(`/usr/share/prints/${object.spec?.path || ''}`, { recursive: true }, (err: any) => {
                            if (err) {
                                return console.error(err)
                            }
                            console.log('Directory ' + path + ' created successfully!')

                            //Creating the schedule task, but without actually starting to run.
                            //It uses the CR name as a key for identifying it and for a posterior stopping.
                            scheduledPrints[name] = cron.schedule(
                                schedule,
                                () => {
                                    //Listing all the pods using the k8s CoreV1Api api client for js that is already 
                                    // been used by the operator-node package
                                    this.k8sApi.listPodForAllNamespaces().then(async (res: { body: any }) => {
                                        var today = new Date().toLocaleString()
                                        //Apending to a file using the path from the yaml
                                        await fs.appendFile(
                                            path,
                                            `--------------\n From Print: ${name} - Date: ${today} \n---------------\n`,
                                            (err: any) => {
                                                if (err) throw err
                                            }
                                        )
                                        //Getting the items of the client response and appending to the file
                                        console.log(`New Print to ${path} at: ${today}`)
                                        res.body.items.forEach(async (item: any) => {
                                            var data = item.metadata?.name

                                            await fs.appendFile(path, data + '\n', function (err: any) {
                                                if (err) throw err
                                            })
                                        })
                                    })
                                },
                                {
                                    scheduled: false,
                                }
                            )

                            //Starting the saved schedule
                            scheduledPrints[name].start()
                        })
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
                        scheduledPrints[name].stop()
                    } catch (error) {
                        console.log(error)
                    }

                    break
            }
        })
    }
}