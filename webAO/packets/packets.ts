import { handleMS } from './handlers/handleMS';
import { handleCT } from './handlers/handleCT'
import { handleMC } from './handlers/handleMC'
import { handleRMC } from './handlers/handleRMC'
import { handleFL } from './handlers/handleFL'
import { handleLE } from './handlers/handleLE'
import { handleEM } from './handlers/handleEM'
import { handleEI } from './handlers/handleEI'
import { handleSC } from './handlers/handleSC'
import { handleCI } from './handlers/handleCI'
import { handleFM } from './handlers/handleFM'
import { handleFA } from './handlers/handleFA'
import { handleSM } from './handlers/handleSM'
import { handleMM } from './handlers/handleMM'
import { handleBD } from './handlers/handleBD'
import { handleBB } from './handlers/handleBB'
import { handleKB } from './handlers/handleKB'
import { handleKK } from './handlers/handleKK'
import { handleDONE } from './handlers/handleDONE'
import { handleBN } from './handlers/handleBN'
import { handleHP } from './handlers/handleHP'
import { handleRT } from './handlers/handleRT'
import { handleTI } from './handlers/handleTI'
import { handleZZ } from './handlers/handleZZ'
import { handleHI } from './handlers/handleHI'
import { handleID } from './handlers/handleID'
import { handlePN } from './handlers/handlePN'
import { handleSI } from './handlers/handleSI'
import { handleARUP } from './handlers/handleARUP'
import { handleaskchaa } from './handlers/handleaskchaa'
import { handleCC } from './handlers/handleCC'
import { handleRC } from './handlers/handleRC'
import { handleRM } from './handlers/handleRM'
import { handleRD } from './handlers/handleRD'
import { handleCharsCheck } from './handlers/handleCharsCheck'
import { handlePV } from './handlers/handlePV'
import { handleASS } from './handlers/handleASS'
import { handleackMS } from './handlers/handleackMS'
import { handleSP } from './handlers/handleSP'
import { handleJD } from './handlers/handleJD'
import { handlePU } from './handlers/handlePU'
import { handlePR } from './handlers/handlePR'

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
    "PU": handlePU,
    "PR": handlePR,
    "decryptor": () => { },
    "CHECK": () => { },
    "CH": () => { },
}