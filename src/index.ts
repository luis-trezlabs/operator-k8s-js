const k8s = require('@kubernetes/client-node')
const fs = require('fs')

//Creating new instance of the kubeconfig class from the api to access methods
const kc = new k8s.KubeConfig()
//Loading kubeconfig context from default/ cluster
kc.loadFromCluster()
// Declaring api client for the coreV1Api export of the typescript client
const k8sApi = kc.makeApiClient(k8s.CoreV1Api)

//Getting the PATH from env
const path = '/usr/share/prints/' + process.env.PRINT_PATH
const filename = process.env.PRINT_FILENAME + '.txt'
const full_path =  path + filename || '/usr/share/prints/pods.txt'

console.info('Printing the pods name to the path ' + path)

try {
    //Creating the directory  with the recursive option in case that the
    //path already exists
    fs.mkdir(path, { recursive: true }, (err: any) => {
        if (err) {
            return console.error(err)
        }
        
        //Listing all the pods using the k8s api client for js
        k8sApi.listPodForAllNamespaces().then(async (res: { body: any }) => {
            var today = new Date().toLocaleString()
            //Apending to a file using the path from the yaml
            await fs.appendFile(
                full_path,
                `--------------\n Date: ${today} \n---------------\n`,
                (err: any) => {
                    if (err) throw err
                }
            )
            //Getting the items of the client response and appending to the file
            console.log(`New Print to ${full_path} at: ${today}`)
            res.body.items.forEach(async (item: any) => {
                var data = item.metadata?.name
                console.log('printing pod: ' + data)
                await fs.appendFile(full_path, data + '\n', function (err: any) {
                    if (err) throw err
                })
            })
        })       
    })
            
} catch (error) {
    console.log(error)
}
