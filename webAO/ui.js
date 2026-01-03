/* eslint indent: ["error", 2, { "SwitchCase": 1 }] */
/* eslint no-param-reassign: ["error",
{ "props": true, "ignorePropertyModificationsFor": ["container"] }] */
import { GoldenLayout } from "golden-layout";

window.config = {
  settings: {
    showPopoutIcon: false,
    showCloseIcon: false,
  },
  dimensions: {
    minItemHeight: 40,
  },
  content: [
    {
      type: "row",
      content: [
        {
          type: "column",
          width: 40,
          content: [
            {
              type: "component",
              height: 80,
              isClosable: false,
              componentName: "template",
              title: "IC",
              componentState: { id: "client_wrapper" },
            },
            {
              type: "component",
              height: 20,
              isClosable: false,
              title: "IC Options",
              componentName: "template",
              componentState: { id: "icoptions" },
            },
          ],
        },
        {
          type: "column",
          content: [
            {
              type: "row",
              height: 65,
              content: [
                {
                  type: "stack",
                  content: [
                    {
                      type: "component",
                      isClosable: false,
                      title: "Main",
                      componentName: "template",
                      componentState: { id: "mainmenu" },
                    },
                    {
                      type: "component",
                      isClosable: false,
                      title: "Log",
                      componentName: "template",
                      componentState: { id: "log" },
                    },
                  ],
                },
                {
                  type: "stack",
                  width: 30,
                  content: [
                    {
                      type: "component",
                      isClosable: false,
                      title: "Music",
                      componentName: "template",
                      componentState: { id: "music" },
                    },
                    {
                      type: "component",
                      isClosable: true,
                      title: "Players",
                      componentName: "template",
                      componentState: { id: "players" },
                    },
                  ],
                },
              ],
            },
            {
              type: "row",
              content: [
                {
                  type: "component",
                  title: "OOC",
                  componentName: "template",
                  componentState: { id: "ooc" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const configMobile = {
  settings: {
    showPopoutIcon: false,
    showCloseIcon: false,
  },
  dimensions: {
    minItemHeight: 40,
  },
  content: [
    {
      type: "row",
      content: [
        {
          type: "column",
          content: [
            {
              type: "component",
              isClosable: false,
              reorderEnabled: false,
              componentName: "template",
              title: "IC",
              componentState: { id: "client_wrapper" },
              height: 56, // Adjust the height proportion as needed
            },
            {
              type: "stack",
              height: 44,
              content: [
                {
                  type: "component",
                  isClosable: false,
                  reorderEnabled: false,
                  title: "IC Options",
                  componentName: "template",
                  componentState: { id: "icoptions" },
                },
                {
                  type: "component",
                  isClosable: false,
                  reorderEnabled: false,
                  title: "Main",
                  componentName: "template",
                  componentState: { id: "mainmenu" },
                },
                {
                  type: "component",
                  isClosable: false,
                  reorderEnabled: false,
                  title: "Log",
                  componentName: "template",
                  componentState: { id: "log" },
                },
                {
                  type: "component",
                  isClosable: false,
                  reorderEnabled: false,
                  title: "Music",
                  componentName: "template",
                  componentState: { id: "music" },
                },
                {
                  type: "component",
                  isClosable: true,
                  title: "Players",
                  componentName: "template",
                  componentState: { id: "players" },
                },
                {
                  type: "component",
                  isClosable: false,
                  reorderEnabled: false,
                  title: "OOC",
                  componentName: "template",
                  componentState: { id: "ooc" },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const isMobileDevice = window.innerWidth <= window.innerHeight;

const golden = new GoldenLayout();
golden.registerComponentFactoryFunction(
  "template",
  (container, componentState) => {
    const template = document.querySelector(`#${componentState.id}`);
    container.element.innerHTML = template.innerHTML;
  },
);
if (isMobileDevice) {
  golden.loadLayout(configMobile);
} else {
  golden.loadLayout(config);
}

function adjustSplitter() {
  if (isMobileDevice) return; // Skip for mobile layout
  const column = golden.root.contentItems[0].contentItems[0];
  const icItem = column.contentItems[0];
  const icOptionsItem = column.contentItems[1];
  const paneWidth = icItem.element.clientWidth;
  const gamewindowHeight = 0.75 * paneWidth;
  const inputEl = document.getElementById('client_inputbox');
  const barsEl = document.getElementById('client_bars');
  const inputHeight = inputEl ? inputEl.offsetHeight : 30; // fallback
  const barsHeight = barsEl ? barsEl.offsetHeight : 20; // fallback
  const totalHeight = Math.ceil(gamewindowHeight + inputHeight + barsHeight + 45); // Add 45px offset
  const columnHeight = column.element.clientHeight;
  if (columnHeight === 0) return;
  const percentage = Math.min(90, Math.max(10, (totalHeight / columnHeight) * 100));

  icItem.element.style.height = `${totalHeight}px`;
  icItem.element.children[1].style.height = `100%`;
  icItem.element.children[1].children[0].style.height = `100%`;
  icItem.element.children[1].children[0].children[0].style.height = `100%`;

  icOptionsItem.element.style.height = `calc(100% - ${totalHeight}px)`;
  icOptionsItem.element.children[1].style.height = `100%`;
  icOptionsItem.element.children[1].children[0].style.height = `100%`;
  icOptionsItem.element.children[1].children[0].children[0].style.height = `100%`;
}

window.addEventListener('resize', () => setTimeout(adjustSplitter, 100));
setTimeout(adjustSplitter, 100); // Initial call

// Also adjust on item resize
golden.root.contentItems[0].contentItems[0].contentItems[0].on("resize", () => setTimeout(adjustSplitter, 50));
