/**
 * Returns whether the user has chosen to enable pan-tilt.
 * Defaults to `false` so pan-tilt is always off unless the user opts in.
 */
export function isPanTiltEnabled(): boolean {
  return localStorage.getItem("panTilt") === "true";
}

/**
 * Triggered by the pantilt checkbox.
 * Persists the choice to localStorage.
 */
export async function switchPanTilt() {
  const fullview = document.getElementById("client_fullview")!;
  const checkbox = <HTMLInputElement>document.getElementById("client_pantilt");
  const enabled = !!checkbox?.checked;

  localStorage.setItem("panTilt", enabled ? "true" : "false");

  if (enabled) {
    fullview.style.transition = "0.5s ease-in-out";
  } else {
    fullview.style.transition = "none";
  }
}
window.switchPanTilt = switchPanTilt;
