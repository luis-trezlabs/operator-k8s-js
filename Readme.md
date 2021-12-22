# K8S Typescript based print-operator

## Installing the helm chart

To install the kubernetes resources needed,
You can run
```bash
helm install my-print-operator ./chart
```
If you wish, you can change a few helm values on the /chart/values.yaml:
```yaml
#Name for the resources
name: print-operator
#Image version
deployment:
  image: marvintrezlabs/print-operator
  tag: latest
```

### Applying CR
You can specify the path of the output where the pods name and the date will be appended.
The example can also be found on resources/print-sample.yaml
```yaml
apiVersion: stable.marvfadev.me/v1
kind: Print
metadata:
  name: print-sample
  namespace: default
spec:
  #The filename or path where the pod names will be printed. 
  #Ether if u write a path/filename.txt or filename.txt, it will have as a parent the /prints directory on the host machine.
  path: pods.txt
  #Interval in which the print will execute
  schedule: "*/8 * * * * *"
```
Now you can apply the resource and start seeing the prints.
```bash
kubectl apply -f resources/print-sample.yaml
```
## Seeing the file with the results
### Minikube
If you are using minikube, you should go to the terminal an run
```bash
minikube ssh
```
To enter to the minikube virtual machine (That represents the host of the cluster) where the volume for the operator has been mounted.

Then, you will be able to see the file in the path: prints/<your-spec-path-param/.txt-file>
```bash
cat /prints/pods.txt
```

Otherwise you should connect to the host machine via ssh and retrieve the .txt file

## To-do

- [Done] Cron format schedule spec input for specifying time interval.

- [Done] Checking when there is more than one custom resource created.

- [Done] Stoping node-cron task when the custom resource is deleted

- [XD] Understanding all the code

- [Done] Mapping volumes to access the file

- Organize typescript

- [Done] Fix Dockerfile and test to run the container

- [Done] Create initial helm chart

- [Done] testing in cluster

- Test filename change/ Fix when a path is not empty