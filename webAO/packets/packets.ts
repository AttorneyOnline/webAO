import { handleMS } from './handlers/handleMS.js';
import { handleCT } from './handlers/handleCT.js'
import { handleMC } from './handlers/handleMC.js'
import { handleRMC } from './handlers/handleRMC.js'
import { handleFL } from './handlers/handleFL.js'
import { handleLE } from './handlers/handleLE.js'
import { handleEM } from './handlers/handleEM.js'
import { handleEI } from './handlers/handleEI.js'
import { handleSC } from './handlers/handleSC.js'
import { handleCI } from './handlers/handleCI.js'
import { handleFM } from './handlers/handleFM.js'
import { handleFA } from './handlers/handleFA.js'
import { handleSM } from './handlers/handleSM.js'
import { handleMM } from './handlers/handleMM.js'
import { handleBD } from './handlers/handleBD.js'
import { handleBB } from './handlers/handleBB.js'
import { handleKB } from './handlers/handleKB.js'
import { handleKK } from './handlers/handleKK.js'
import { handleDONE } from './handlers/handleDONE.js'
import { handleBN } from './handlers/handleBN.js'
import { handleHP } from './handlers/handleHP.js'
import { handleRT } from './handlers/handleRT.js'
import { handleTI } from './handlers/handleTI.js'
import { handleZZ } from './handlers/handleZZ.js'
import { handleHI } from './handlers/handleHI.js'
import { handleID } from './handlers/handleID.js'
import { handlePN } from './handlers/handlePN.js'
import { handleSI } from './handlers/handleSI.js'
import { handleARUP } from './handlers/handleARUP.js'
import { handleaskchaa } from './handlers/handleaskchaa.js'
import { handleCC } from './handlers/handleCC.js'
import { handleRC } from './handlers/handleRC.js'
import { handleRM } from './handlers/handleRM.js'
import { handleRD } from './handlers/handleRD.js'
import { handleCharsCheck } from './handlers/handleCharsCheck.js'
import { handlePV } from './handlers/handlePV.js'
import { handleASS } from './handlers/handleASS.js'
import { handleackMS } from './handlers/handleackMS.js'
import { handleSP } from './handlers/handleSP.js'
import { handleJD } from './handlers/handleJD.js'

export const packets = {
    "MS": handleMS,
    "CT": handleCT,
    "MC": handleMC,
    "RMC": handleRMC,
    "CI": handleCI,
    "SC": handleSC,
    "EI": handleEI,
    "FL": handleFL,
    "LE": handleLE,
    "EM": handleEM,
    "FM": handleFM,
    "FA": handleFA,
    "SM": handleSM,
    "MM": handleMM,
    "BD": handleBD,
    "BB": handleBB,
    "KB": handleKB,
    "KK": handleKK,
    "DONE": handleDONE,
    "BN": handleBN,
    "HP": handleHP,
    "RT": handleRT,
    "TI": handleTI,
    "ZZ": handleZZ,
    "HI": handleHI,
    "ID": handleID,
    "PN": handlePN,
    "SI": handleSI,
    "ARUP": handleARUP,
    "askchaa": handleaskchaa,
    "CC": handleCC,
    "RC": handleRC,
    "RM": handleRM,
    "RD": handleRD,
    "CharsCheck": handleCharsCheck,
    "PV": handlePV,
    "ASS": handleASS,
    "ackMS": handleackMS,
    "SP": handleSP,
    "JD": handleJD,
    "decryptor": () => { },
    "CHECK": () => { },
    "CH": () => { },
}
