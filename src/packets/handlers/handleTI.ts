/**
 * Handles a timer update
 * @param {Array} args packet arguments
 */
export const handleTI = (args: string[]) => {
  const timerid = Number(args[1]);
  const type = Number(args[2]);
  const timer_value = args[3];
  switch (type) {
    case 0:
    //
    case 1:
      document.getElementById(`client_timer${timerid}`)!.innerText =
        timer_value;
    case 2:
      document.getElementById(`client_timer${timerid}`)!.style.display = "";
    case 3:
      document.getElementById(`client_timer${timerid}`)!.style.display = "none";
  }
};
