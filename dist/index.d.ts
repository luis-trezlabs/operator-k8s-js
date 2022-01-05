declare const k8s: any;
declare const fs: any;
declare const kc: any;
declare const k8sApi: any;
declare const path: string;
declare const filename: string;
declare const full_path: string;
declare function printTitle(date: string, path: string, namespace?: string): Promise<void>;
declare function printBody(data: any, path: any): Promise<void>;
