/** 
* i am mod now
* @param {Array} args packet arguments
*/
export const handleAUTH = (args: string[]) => {
    (<HTMLAnchorElement>(
        document.getElementById("mod_ui")
    )).href = `styles/mod.css`;
}
