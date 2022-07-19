/**
 * Highlights and selects a menu.
 * @param {number} menu the menu to be selected
 */
export function toggleMenu(menu: number) {
  if (menu !== selectedMenu) {
    document.getElementById(`menu_${menu}`).className = "menu_button active";
    document.getElementById(`content_${menu}`).className =
      "menu_content active";
    document.getElementById(`menu_${selectedMenu}`).className = "menu_button";
    document.getElementById(`content_${selectedMenu}`).className =
      "menu_content";
    selectedMenu = menu;
  }
}
window.toggleMenu = toggleMenu;
