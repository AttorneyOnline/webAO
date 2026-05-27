/**
 * A codec for a single packet header. `decode` parses the `#`-split args
 * (with args[0] being the header) into a typed packet. `encode` serializes
 * a typed packet back to the wire format, including the trailing `#%`.
 *
 * `encode` is optional: legacy packets that are receive-only or have not
 * been migrated to a typed sender omit it. The dispatcher only calls
 * `decode`; encoders are called directly by name from the sender modules.
 *
 * Defining these together per packet ensures that serialization and
 * deserialization for a given packet live in exactly one place.
 */
export interface PacketCodec<TPacket> {
  decode(args: string[]): TPacket;
  encode?(packet: TPacket): string;
}

/**
 * One registry entry: the codec that converts wire <-> typed, paired with
 * the handler that consumes the typed packet.
 */
export interface PacketEntry<TPacket> {
  codec: PacketCodec<TPacket>;
  handle: (packet: TPacket) => void;
}

/**
 * Adapter for handlers that have not yet been migrated to typed packets.
 * The codec is the identity (passing the raw `string[]` through), and the
 * handler still receives the args array. Remove a packet from this adapter
 * once it has a proper typed codec + handler.
 */
export const legacyEntry = (
  handle: (args: string[]) => void,
): PacketEntry<string[]> => ({
  codec: { decode: (args) => args },
  handle,
});
