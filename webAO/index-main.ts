import { main, setServ } from "./master.js"

// Functions called from index.html need to be exposed with window.
(window as any).setServ = setServ;

main();
