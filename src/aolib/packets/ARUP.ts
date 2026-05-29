/**
 * ARUP (s2c) — area-status update.
 *
 * `update_type` discriminates how the trailing payload should be
 * interpreted: type 0 is player counts (numbers), types 1 / 2 / 3 are
 * area-metadata strings (status name, CM name, lock state).
 *
 * Wire: `ARUP#<update_type>#<value_for_area_0>#<value_for_area_1>#...#%`.
 *
 * The shape doesn't fit cleanly into the standard greedy-array
 * primitive — the element type depends on a *sibling* field's value —
 * so the schema uses a `toArgs` / `fromArgs` override to walk the
 * trailing slots itself. The `update_data` field in the schema is a
 * one-slot placeholder; the override owns its serialization.
 *
 * The typed payload is `number[] | string[]`. Callers that want full
 * type narrowing should switch on `update_type` first.
 */

import { packet } from "../schema";
import { num, custom, type CustomField } from "../fields";

/** Which area-metadata field the packet updates. */
export enum AreaUpdateType {
  PLAYER_COUNT = 0,
  STATUS = 1,
  CASE_MANAGER = 2,
  LOCKED = 3,
}

/**
 * Payload type: numbers for PLAYER_COUNT, strings for everything else.
 * `number | string` per-cell would be a noisier union — at runtime the
 * whole array is homogeneous, so we expose that as `number[] | string[]`.
 */
export type AreaUpdateData = number[] | string[];

// ---------------------------------------------------------------------
// Chat-escape helpers — string-typed payload values may contain `#` /
// `&` / `%` / `$`, and have to be escaped on the way out. Mirrors the
// legacy ARUP behavior so a fresh aolib client can talk to a legacy
// server without metadata corruption.
// ---------------------------------------------------------------------

const escapeFanta = (s: string): string =>
  s
    .replaceAll("#", "<num>")
    .replaceAll("&", "<and>")
    .replaceAll("%", "<percent>")
    .replaceAll("$", "<dollar>");

const unescapeFanta = (s: string): string =>
  s
    .replaceAll("<num>", "#")
    .replaceAll("<and>", "&")
    .replaceAll("<percent>", "%")
    .replaceAll("<dollar>", "$");

// ---------------------------------------------------------------------
// Field types
// ---------------------------------------------------------------------

const parseUpdateType = (s: string): AreaUpdateType => {
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n <= 3
    ? (n as AreaUpdateType)
    : AreaUpdateType.PLAYER_COUNT;
};

const areaUpdateTypeField = (): CustomField<AreaUpdateType> =>
  custom<AreaUpdateType>({
    fromFanta: (token) => parseUpdateType(token),
    toFanta: (value) => String(value),
    fromJson: (value) => parseUpdateType(String(value)),
    toJson: (value) => value,
  });

/**
 * The payload field is a placeholder — its fanta codec throws if it
 * ever runs. The schema-level `toArgs` / `fromArgs` override takes
 * over the fanta path. On JSON, the default identity hooks pass the
 * (heterogeneous) array through; JSON-native serialization preserves
 * `number[]` and `string[]` cleanly.
 */
const updateDataField = (): CustomField<AreaUpdateData> =>
  custom<AreaUpdateData>({
    fromFanta: () => {
      throw new Error(
        "aolib: ARUP.update_data is consumed by the schema's fromArgs " +
          "override, not the standard fanta walker — this codec should " +
          "never be invoked.",
      );
    },
    toFanta: () => {
      throw new Error(
        "aolib: ARUP.update_data is emitted by the schema's toArgs " +
          "override, not the standard fanta walker — this codec should " +
          "never be invoked.",
      );
    },
  });

// ---------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------

export const ARUP = packet(
  "ARUP",
  {
    update_type: areaUpdateTypeField(),
    update_data: updateDataField(),
  },
  {
    toArgs: (p) => {
      const ap = p as {
        update_type: AreaUpdateType;
        update_data: AreaUpdateData;
      };
      const dataSlots =
        ap.update_type === AreaUpdateType.PLAYER_COUNT
          ? (ap.update_data as number[]).map(String)
          : (ap.update_data as string[]).map(escapeFanta);
      return [String(ap.update_type), ...dataSlots];
    },
    fromArgs: (args) => {
      const update_type = parseUpdateType(args[0] ?? "");
      const rest = args.slice(1);
      const update_data: AreaUpdateData =
        update_type === AreaUpdateType.PLAYER_COUNT
          ? rest.map((v) => {
              const n = Number(v);
              return Number.isFinite(n) ? n : 0;
            })
          : rest.map(unescapeFanta);
      return { update_type, update_data };
    },
  },
);
