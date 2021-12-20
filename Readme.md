# K8S Typescript based operator

## CRD spected
You can specify the path of the output where the pods name and the date will be appended.
```yaml
apiVersion: stable.marvfadev.me/v1
kind: Print
metadata:
  name: print-sample
  namespace: default
spec:
  path: pods.txt
```

## To-do
- Complete kubernetes resources for the operator deployment.

- Cron format schedule spec input for specifying time interval.

- Validation when there is more than one crd created.

- Checking node-cron library performance.

- Organize typescript

- Dockerfile

- Create final helm chart to deliver to the client