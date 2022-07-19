/**
 * Triggered by the pantilt checkbox
 */
export async function switchPanTilt() {
  const fullview = document.getElementById("client_fullview");
  const checkbox = <HTMLInputElement>document.getElementById("client_pantilt");

  if (checkbox.checked) {
    fullview.style.transition = "0.5s ease-in-out";
  } else {
    fullview.style.transition = "none";
  }

  return;
}
window.switchPanTilt = switchPanTilt;
