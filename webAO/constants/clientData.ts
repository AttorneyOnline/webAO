declare let __APP_VERSION__: string;
export const clientVersion = __APP_VERSION__;
declare let __MODE__: string;
export const clientMode = (import.meta as any).env.MODE;
