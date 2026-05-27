/**
 * Returns whether the user has chosen to hide courtroom desks.
 * Defaults to `false` so desks always show unless the user opts in.
 */
export function isHideDesksEnabled(): boolean {
  return localStorage.getItem("hideDesks") === "true";
}

/**
 * Triggered by the hide desks checkbox.
 * Persists the choice and refreshes the current viewport so the change
 * applies immediately without waiting for the next chat message.
 */
export async function switchHideDesks() {
  const checkbox = <HTMLInputElement>document.getElementById("client_hidedesks");
  const enabled = !!checkbox?.checked;
  localStorage.setItem("hideDesks", enabled ? "true" : "false");

  const benches = ["client_def_bench", "client_wit_bench", "client_pro_bench", "client_bench_classic"];
  for (const id of benches) {
    const bench = <HTMLImageElement | null>document.getElementById(id);
    if (bench) bench.style.opacity = enabled ? "0" : "1";
  }
}
