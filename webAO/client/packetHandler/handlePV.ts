/**
 * Handles the server's assignment of a character for the player to use.
 * PV # playerID (unused) # CID # character ID
 * @param {Array} args packet arguments
 */
export const handlePV = async (args: string[]) => {
  this.charID = Number(args[3]);
  document.getElementById("client_waiting").style.display = "none";
  document.getElementById("client_charselect").style.display = "none";

  const me = this.chars[this.charID];
  this.selectedEmote = -1;
  const { emotes } = this;
  const emotesList = document.getElementById("client_emo");
  emotesList.style.display = "";
  emotesList.innerHTML = ""; // Clear emote box
  const ini = me.inifile;
  me.side = ini.options.side;
  updateActionCommands(me.side);
  if (ini.emotions.number === 0) {
    emotesList.innerHTML = `<span
					id="emo_0"
					alt="unavailable"
					class="emote_button">No emotes available</span>`;
  } else {
    for (let i = 1; i <= ini.emotions.number; i++) {
      try {
        const emoteinfo = ini.emotions[i].split("#");
        let esfx;
        let esfxd;
        try {
          esfx = ini.soundn[i] || "0";
          esfxd = Number(ini.soundt[i]) || 0;
        } catch (e) {
          console.warn("ini sound is completly missing");
          esfx = "0";
          esfxd = 0;
        }
        // Make sure the asset server is case insensitive, or that everything on it is lowercase

        emotes[i] = {
          desc: emoteinfo[0].toLowerCase(),
          preanim: emoteinfo[1].toLowerCase(),
          emote: emoteinfo[2].toLowerCase(),
          zoom: Number(emoteinfo[3]) || 0,
          deskmod: Number(emoteinfo[4]) || 1,
          sfx: esfx.toLowerCase(),
          sfxdelay: esfxd,
          frame_screenshake: "",
          frame_realization: "",
          frame_sfx: "",
          button: `${AO_HOST}characters/${encodeURI(
            me.name.toLowerCase()
          )}/emotions/button${i}_off.png`,
        };
        emotesList.innerHTML += `<img src=${emotes[i].button}
					id="emo_${i}"
					alt="${emotes[i].desc}"
					class="emote_button"
					onclick="pickEmotion(${i})">`;
      } catch (e) {
        console.error(`missing emote ${i}`);
      }
    }
    pickEmotion(1);
  }

  if (
    await fileExists(
      `${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/custom.gif`
    )
  ) {
    document.getElementById("button_4").style.display = "";
  } else {
    document.getElementById("button_4").style.display = "none";
  }

  const iniedit_select = <HTMLSelectElement>(
    document.getElementById("client_ininame")
  );

  // Load iniswaps if there are any
  try {
    const cswapdata = await request(
      `${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/iniswaps.ini`
    );
    const cswap = cswapdata.split("\n");

    // most iniswaps don't list their original char
    if (cswap.length > 0) {
      iniedit_select.innerHTML = "";

      iniedit_select.add(new Option(safeTags(me.name)));

      cswap.forEach((inisw: string) =>
        iniedit_select.add(new Option(safeTags(inisw)))
      );
    }
  } catch (err) {
    console.info("character doesn't have iniswaps");
    this.fetchCharacterList();
  }
};
