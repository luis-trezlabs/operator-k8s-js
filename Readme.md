# K8S Typescript based print-operator

## Installing the helm chart

To install the kubernetes resources needed,
You can run
```bash
helm install my-print-operator ./chart
```

## CRD spected
You can specify the path of the output where the pods name and the date will be appended.
The example can also be found on resources/print-sample.yaml
```yaml
apiVersion: stable.marvfadev.me/v1
kind: Print
metadata:
  name: print-sample
  namespace: default
spec:
  #The path where the pods names will be printed
  path: pods.txt
  #Schedule in cron format
  schedule: "*/8 * * * * *"
```


## To-do

- [Done] Cron format schedule spec input for specifying time interval.

- [Done] Checking when there is more than one custom resource created.

- [Done] Stoping node-cron task when the custom resource is deleted

- [XD] Understanding all the code

- Organize typescript

- Fix Dockerfile and test to run the container

- [Done] Create initial helm chart

- Final testing