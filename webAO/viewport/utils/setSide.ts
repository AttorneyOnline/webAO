import { positions } from '../constants/positions.js'
import { AO_HOST } from '../../client/aoHost.js'
import { client } from '../../client.js'
import tryUrls from '../../utils/tryUrls.js';
import findImgSrc from '../../utils/findImgSrc.js';

/**
 * Changes the viewport background based on a given position.
 *
 * Valid positions: `def, pro, hld, hlp, wit, jud, jur, sea`
 * @param {string} position the position to change into
 */
export const set_side = async ({
    position,
    showSpeedLines,
    showDesk,
}: {
    position: string;
    showSpeedLines: boolean;
    showDesk: boolean;
}) => {
    const view = document.getElementById("client_fullview")!;
    let bench: HTMLImageElement;
    if (['def', 'pro', 'wit'].includes(position)) {
        bench = <HTMLImageElement>(
            document.getElementById(`client_${position}_bench`)
        );
    } else {
        bench = <HTMLImageElement>document.getElementById("client_bench_classic");
    }

    let court: HTMLImageElement;
    if ("def,pro,wit".includes(position)) {
        court = <HTMLImageElement>(
            document.getElementById(`client_court_${position}`)
        );
    } else {
        court = <HTMLImageElement>document.getElementById("client_court_classic");
    }

    let bg;
    let desk;
    let speedLines;

    if ("def,pro,hld,hlp,wit,jud,jur,sea".includes(position)) {
        bg = positions[position].bg;
        desk = positions[position].desk;
        speedLines = positions[position].speedLines;
    } else {
        bg = `${position}`;
        desk = { ao2: `${position}_overlay.png`, ao1: "_overlay.png" };
        speedLines = "defense_speedlines.gif";
    }

    if (showSpeedLines === true) {
        court.src = `${AO_HOST}themes/default/${encodeURI(speedLines)}`;
    } else {
        court.src = await tryUrls(client.viewport.getBackgroundFolder() + bg);
    }

    if (showDesk === true && desk) {
        const bg_folder = client.viewport.getBackgroundFolder();
        const urls_to_try = [
            bg_folder + desk.ao2,
            bg_folder + desk.ao1,
        ];
        bench.src = await findImgSrc(urls_to_try);
        bench.style.opacity = "1";
    } else {
        bench.style.opacity = "0";
    }

    if ("def,pro,wit".includes(position)) {
        view.style.display = "";
        document.getElementById("client_classicview")!.style.display = "none";
        switch (position) {
            case "def":
                view.style.left = "0";
                break;
            case "wit":
                view.style.left = "-200%";
                break;
            case "pro":
                view.style.left = "-400%";
                break;
        }
    } else {
        view.style.display = "none";
        document.getElementById("client_classicview").style.display = "";
    }
};
