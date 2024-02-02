import { main } from './client.js'
import { hcallback } from "./dom/twofactor.js";
import { pickChar} from "./dom/pickChar.js";

window.hcallback = hcallback;
window.pickChar = pickChar;

main();
