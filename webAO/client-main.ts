import { main } from './client.js'
import { hcallback } from "./dom/twofactor.js";
import { pickChar} from "./dom/pickChar.js";

// Functions called from client.html need to be exposed with window.
window.hcallback = hcallback;
window.pickChar = pickChar;

main();
