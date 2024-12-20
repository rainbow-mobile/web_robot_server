export interface NetworkPayload {
    device: string;
    type: string;
    hwAddr: string;
    name: string;
    state: string;
    ip: string;
    mask: string;
    gateway: string;
    dns: string[];
    signal_level?: number;
    quality?:number;
    security?:string;
  }
  
  export const defaultNetwork:NetworkPayload={
    device:"",
    type: "",
    hwAddr: "",
    name: "",
    state: "",
    ip: "",
    mask: "",
    gateway: "",
    dns: []

  }