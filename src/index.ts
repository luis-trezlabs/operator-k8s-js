import Operator, { ResourceEventType, ResourceEvent } from '@dot-i/k8s-operator'
import { KubernetesObject } from '@kubernetes/client-node'
const cron = require('node-cron')
const k8s = require('@kubernetes/client-node')
const fs = require('fs')


const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const k8sApi = kc.makeApiClient(k8s.CoreV1Api)

export interface PrintResource extends KubernetesObject {
    spec: PrintResourceSpec;
}

export interface PrintResourceSpec {    
    path: string;
}


export default class MyOperator extends Operator {
    protected async init() {
        await this.watchResource('stable.marvfadev.me', 'v1', 'prints', async (e) => {

            const object = e.object as PrintResource;
            const path = object.spec?.path
            switch (e.type) {
                case ResourceEventType.Added:
                    try {
                        cron.schedule('*/10 * * * * *', () => {
                            k8sApi.listPodForAllNamespaces().then((res: { body: any }) => {
                                res.body.items.forEach(async (item: any) => {
                                    var today = new Date().toLocaleString()
                                    var data = 'Date: ' + today + ' - ' + item.metadata?.name
                            
                                    await fs.appendFile(path, data + '\n', function (err: any) {
                                        if (err) throw err
                                        console.log('Date: ' + today + ' - ' + item.metadata?.name)
                                    })
                                })
                            })
                        })
                    } catch (error) {
                        console.log(error)
                    }

                    break
                case ResourceEventType.Modified:
                    // do something useful here
                    break
                case ResourceEventType.Deleted:
                    // do something useful here
                    break
            }
        })
    }
}

async function main() {
    const operator = new MyOperator()
    await operator.start()

    const exit = (reason: string) => {
        operator.stop()
        process.exit(0)
    }

    process.on('SIGTERM', () => exit('SIGTERM')).on('SIGINT', () => exit('SIGINT'))
}

main()
