import Operator from '@dot-i/k8s-operator';
import { KubernetesObject } from '@kubernetes/client-node';
export interface PrintResource extends KubernetesObject {
    spec: PrintResourceSpec;
}
export interface PrintResourceSpec {
    path: string;
}
export default class MyOperator extends Operator {
    protected init(): Promise<void>;
}
