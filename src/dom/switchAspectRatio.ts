/**
 * Triggered by the change aspect ratio checkbox
 */
export async function switchAspectRatio() {
  const background = document.getElementById("client_gamewindow")!;
  const offsetCheck = <HTMLInputElement>(
    document.getElementById("client_hdviewport_offset")
  );
  if (
    (<HTMLInputElement>document.getElementById("client_hdviewport")).checked
  ) {
    background.style.paddingBottom = "56.25%";
    offsetCheck.disabled = false;
  } else {
    background.style.paddingBottom = "75%";
    offsetCheck.disabled = true;
  }
}
window.switchAspectRatio = switchAspectRatio;
