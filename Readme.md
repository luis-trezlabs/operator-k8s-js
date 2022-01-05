# K8S Typescript based operator

## To-do
- Complete kubernetes resources for the operator deployment.

- Cron format schedule spec input for specifying time interval.

- Validation when there is more than one crd created.

- Checking node-cron library performance.

- Organize typescript

- Dockerfile

- Create final helm chart to deliver to the client


# Steps to build the project
```bash
  # Clone the project to your local machine
  git clone https://github.com/luis-trezlabs/operator-k8s-js.git
```

```bash
  # Change to cronjob-operator branch
  git checkout cronjob-operator
```

```bash
  # Install the ts-operator-chart chart
  helm install ts-operator-chart ts-operator-chart/

  # Output
  NAME: ts-operator-chart
  LAST DEPLOYED: Wed Jan  5 12:48:08 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
```

Now, the operator is running in our cluster

We can check if everything work as spectated 

```bash
  # Get cronjobs in defined namespace
  kubectl get cronjob -n ts-operator

  # output
  NAME          SCHEDULE    SUSPEND   ACTIVE   LAST SCHEDULE   AGE
  ts-operator   0 * * * *   False     0        4m59s           16m
```

```bash
  # Get pods in our namespace
  kubectl get pods -n ts-operator

  # output
  NAME                            READY   STATUS      RESTARTS   AGE
  ts-operator-27356820--1-wh7zs   0/1     Completed   0          6m3s
```

Our cronjob is working

```bash
  # We can check the out information doing
  kubectl logs <pod-name> -n ts-operator

  kubectl logs ts-operator-27356820--1-wh7zs -n ts-operator

  # output
  NAME                            READY   STATUS      RESTARTS   AGE
  ts-operator-27356820--1-wh7zs   0/1     Completed   0          6m3s
```

Also we can view the out file doing the following

```bash
  # Connect to minikube
  minikube ssh

  # read file
  cat /pod-logs/pods.txt
  
  # output similar to this
  -------------------------
  Time                     Pod Name
  1/5/2022, 8:00:02 PM    coredns-78fcd69978-rfz62
  1/5/2022, 8:00:02 PM    etcd-minikube
  1/5/2022, 8:00:02 PM    kube-apiserver-minikube
  1/5/2022, 8:00:02 PM    kube-controller-manager-minikube
  1/5/2022, 8:00:02 PM    kube-proxy-9pdqd
  1/5/2022, 8:00:02 PM    kube-scheduler-minikube
```

# Steps to create your own operator using node.js

```bash
  # Create a package.json file
  npm init
```

```bash
  # install kubernetes/client-node
  npm install @kubernetes/client-node
```

```bash
  # install kubernetes/client-node
  npm install @kubernetes/client-node
```

```bash
  # Install typescript node
  npm install -D typescript
  npm install -D ts-node
```

Create a tsconfig.json file and past the next settings

```json
  {
    "compilerOptions": {
      "module": "commonjs",
      "target": "es2017",
      "outDir": "dist",
      "esModuleInterop": true,
      "declaration": true,
      "sourceMap": true,
      "strict": true
    },
    "include": [
      "src/**/*"
    ]
  }
```

Add the next line to package.json in "scripts"

```json
  "start": "tsc"
```

```bash
  # Create a "src" directory
  mkdir src
```

```bash
  # Create a ts file call index.ts
  touch src src/index.ts
```

## Let's build our operator 

Import the required packages
```js
  import * as k8s from '@kubernetes/client-node';
  import * as fs from 'fs';
```

General configuration
```js
  const kc = new k8s.KubeConfig();
  
  // loadFromDefault() -> if you are going to use it directly in your cluster (as a CRD)
  // loadFromCluster() -> if you are going to use it as docker image

  // kc.loadFromDefault();
  kc.loadFromCluster();


  // Declaring api client for the coreV1Api export of the typescript client
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
```

General Variables
```js
  const path = '/usr/share/pod-logs/';
  const filename = process.env.FILENAME ? process.env.FILENAME + '.txt' : 'pod-logs.txt';
  const fullPath = path + filename;
```

Our Logic
```js
  try {
    // Create path
    fs.mkdir(path, { recursive: true }, async (err: any) => {
        if (err) throw err;
        
        // Get Pod Names
        k8sApi.listPodForAllNamespaces().then(async (res: { body: any }) => {
            
            // Print Message
            console.log("Time \t\t\t Pod Name");

            // Add message to file
            await fs.appendFile(fullPath, `-------------------------\nTime \t\t\t Pod Name\n`, function (err: any) {
                if (err) throw err;
            });

            // Print in console the current time and pods names
            var today = new Date().toLocaleString();
            res.body.items.forEach(async (element: any) => {
        
                // Print Date and pod name
                console.log(today + '\t' + element.metadata?.name);

                // Add date and pod information to file
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
```

```bash
  # Build the ts project
  npm start
```

## Build the docker image
```bash
  # Create Docker files
  touch .dockerignore
  touch Dockerfile
```

edit .dockerignore file and add this:
```
  node_modules/
```

Add this to Dockerfile:
```dockerfile
  # Image base on node
  FROM node:16

  # Create app directory
  WORKDIR /usr/src/app

  # Install app dependencies
  # A wildcard is used to ensure both package.json AND package-lock.json are copied
  # where available (npm@5+)
  COPY package*.json ./

  RUN npm install
  # If you are building your code for production
  # RUN npm ci --only=production

  # Bundle app source
  COPY . .

  CMD [ "node", "dist/index.js" ]
```

```bash 
  # Build docker image and assign a tag
  docker build . -t luisbodev/js-operator
```

```bash 
  # upload builded image
  docker push luisbodev/js-operator
```

## Create Helm Chart

```bash
  # Create chart
  helm create ts-operator-chart
```

```bash
  # Delete default files that we don't need (We are going to create it after)
  rm -rf ts-operator-chart/templates/*

  rm -f ts-operator-chart/values.yaml
```

Now, we are going to create our required yaml files

- First our values.yaml
```bash
  touch ts-operator-chart/values.yaml
```

values.yaml
```yaml
metadata:
  name: ts-operator
  namespace: ts-operator

image:
  # Image version
  tag: latest
data:
  #Crontab format schedule for the cronjob
          # ┌───────────── minute (0 - 59)
          # │ ┌───────────── hour (0 - 23)
          # │ │ ┌───────────── day of the month (1 - 31)
          # │ │ │ ┌───────────── month (1 - 12)
          # │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday;
          # │ │ │ │ │                                   7 is also Sunday on some systems)
          # │ │ │ │ │
          # │ │ │ │ │
          # * * * * *
  schedule: "0 * * * *"
  #Filename for the output
  filename: 'pods'
```

- Namespace

```bash
  touch ts-operator-chart/templates/namespace.yaml
```

namespace.yaml
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: {{ .Values.metadata.namespace }}
```
- Service Account

```bash
  touch ts-operator-chart/templates/serviceAccount.yaml
```

serviceAccount.yaml
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ts-operator-sa
  namespace: {{ .Values.metadata.namespace }}
```

- Custom Resource

```bash
  touch ts-operator-chart/templates/crd.yaml
```

crd.yaml
```yaml
# Create Custom Resource Definition for the Operator
kind: CustomResourceDefinition
apiVersion: apiextensions.k8s.io/v1
metadata:
  name: operatorpodnames.stable.luisbodev.me
spec:
  group: stable.luisbodev.me
  # either Namespaced or Cluster
  # Namespaced -> Watch objects within that namespace
  # Cluster -> Watch all namespaces in a cluster
  scope: Cluster
  names:
    # plural name to be used in the URL: /apis/<group>/<version>/<plural>
    plural: operatorpodnames
    # singular name to be used as an alias on the CLI and for display
    singular: operatorpodname
    # kind is normally the CamelCased singular type. Your resource manifests use this.
    kind: OperatorPodName
    # shortNames allow shorter string to match your resource on the CLI
    shortNames:
      - opn
    listKind: OperatorPodNameList
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              required:
                - path
              properties:
                path:
                  type: string
                schedule:
                  type: string
```
- Cluster Role

```bash
  touch ts-operator-chart/templates/clusterRole.yaml
```

clusterRole.yaml
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ts-operator-editor-role
rules:
  - apiGroups:
      - stable.luisbodev.me
    resources:
      - operatorpodnames
    verbs:
      - create
      - delete
      - get
      - list
      - patch
      - update
      - watch
  - apiGroups:
      - apps
    verbs:
      - create
      - delete
      - deletecollection
      - get
      - list
      - patch
      - update
      - watch
    resources:
      - daemonsets
      - deployments
      - deployments/rollback
      - deployments/scale
      - replicasets
      - replicasets/scale
      - statefulsets
      - statefulsets/scale
  - apiGroups:
      - ''
    verbs:
      - create
      - delete
      - deletecollection
      - get
      - list
      - patch
      - update
      - watch
    resources:
      - pods
```

- Cluster Role Binding

```bash
  touch ts-operator-chart/templates/clusterRoleBinding.yaml
```

clusterRole.yaml
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: manager-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ts-operator-editor-role
subjects:
  - kind: ServiceAccount
    name: ts-operator-sa
    namespace: {{ .Values.metadata.namespace }}
```

- Cronjob

```bash
  touch ts-operator-chart/templates/cronjob.yaml
```

cronjob.yaml
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: {{ .Values.metadata.name }}
  labels:
    app: {{ .Values.metadata.name }}
  namespace: {{ .Values.metadata.namespace }}
spec:
  schedule: "{{ .Values.data.schedule }}"
  jobTemplate:
    spec:
      template:
        metadata:
          labels:
            app: "{{ .Values.metadata.name }}"
        spec:
          containers:
          - image: "luisbodev/js-operator:{{ .Values.image.tag }}"
            name: {{ .Values.metadata.name }}
            volumeMounts:
              - mountPath: /usr/share/pod-logs
                name: pod-names-log
            env:
              - name: FILENAME
                value: {{ .Values.data.filename }}
          volumes:
          - name: pod-names-log
            hostPath:
              path: /pod-logs
          restartPolicy: OnFailure
          serviceAccount: ts-operator-sa
```

Install our created chart

```bash
  helm install ts-operator-chart ts-operator-chart/

  #output
  NAME: ts-operator-chart
  LAST DEPLOYED: Wed Jan  5 16:08:03 2022
  NAMESPACE: default
  STATUS: deployed
  REVISION: 1
  TEST SUITE: None
```

Uninstall our created chart
```bash
  helm uninstall ts-operator-chart

  #output
  release "ts-operator-chart" uninstalled
```

