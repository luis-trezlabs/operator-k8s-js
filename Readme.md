# CronJob based operator task solution
## Installation

The default values are the following ones but you can update it with your own.
```yaml
name: print-pods
deployment:
  #We suggest not to change the image
  image: marvintrezlabs/print-pods
  tag: latest
data:
  #Crontab format schedule for the cronjob
  schedule: "* * * * *"
  #Host path (will always have the /prints dir as a base)
  path: 'test/'
  #Filename for the output
  filename: 'pods'
```
Update your values.yaml on the chart dir, an then Just run
```bash
helm install print-cronjob ./chart
```

