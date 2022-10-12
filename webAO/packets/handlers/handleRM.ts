import {client} from '../../client'
import vanilla_music_arr from "../../constants/music.js";

  /**
   * we are asking ourselves what characters there are
   * @param {Array} args packet arguments
   */
export const handleRM = (_args: string[]) => {
    client.sender.sendSelf(`SM#${vanilla_music_arr.join("#")}#%`);
  }