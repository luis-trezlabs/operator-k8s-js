import * as k8s from '@kubernetes/client-node';
import * as fs from 'fs';


const kc = new k8s.KubeConfig();

// kc.loadFromDefault();
kc.loadFromCluster();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

const path = '/usr/share/pod-logs/';
const filename = process.env.FILENAME ? process.env.FILENAME + '.txt' : 'pod-logs.txt';
const fullPath = path + filename;


try {
    
    fs.mkdir(path, { recursive: true }, async (err: any) => {
        if (err) throw err;
        
        k8sApi.listPodForAllNamespaces().then(async (res: { body: any }) => {
            
            console.log("Time \t\t\t Pod Name");
            await fs.appendFile(fullPath, `-------------------------\nTime \t\t\t Pod Name\n`, function (err: any) {
                if (err) throw err;
            });

            // Print in console the current time and pods names
            var today = new Date().toLocaleString();
            res.body.items.forEach(async (element: any) => {
        
                console.log(today + '\t' + element.metadata?.name);

                await fs.appendFile(fullPath, today + '\t' +element.metadata?.name + '\n', function (err: any) {
                    if (err) throw err;
                })
            });
            
            console.log('\nTask Executed Successfully!');
            console.log('\nBye!');
        });

    
    });
} catch (error) {
    console.log(error);
}


