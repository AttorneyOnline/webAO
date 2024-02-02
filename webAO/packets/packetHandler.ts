import { packets } from './packets.js'

export const packetHandler: Map<String, Function> = new Map(Object.entries(packets))
