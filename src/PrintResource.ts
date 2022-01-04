import { KubernetesObject } from '@kubernetes/client-node'

//To reference a kubernetes object with that specific specs fields
export interface PrintResource extends KubernetesObject {
    spec: PrintResourceSpec
}

export interface PrintResourceSpec {
    path: string
    schedule: string
    filename: string
    namespace: string
}