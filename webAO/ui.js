/* eslint indent: ["error", 2, { "SwitchCase": 1 }] */
/* eslint no-param-reassign: ["error",
{ "props": true, "ignorePropertyModificationsFor": ["container"] }] */
import { GoldenLayout } from 'golden-layout';

const config = {
  settings: {
    showPopoutIcon: false,
    showCloseIcon: false,
  },
  dimensions: {
    minItemHeight: 40,
  },
  content: [{
    type: 'row',
    content: [{
      type: 'column',
      width: 40,
      content: [{
        type: 'component',
        height: 80,
        isClosable: false,
        componentName: 'template',
        title: 'IC',
        componentState: { id: 'client_wrapper' },
      },
      {
        type: 'component',
        height: 20,
        isClosable: false,
        title: 'IC Options',
        componentName: 'template',
        componentState: { id: 'icoptions' },
      }]
    },
    {
      type: 'column',
      content: [{
        type: 'row',
        height: 65,
        content: [{
          type: 'stack',
          content: [{
            type: 'component',
            isClosable: false,
            title: 'Areas',
            componentName: 'template',
            componentState: { id: 'areas' },
          },
          {
            type: 'component',
            isClosable: false,
            title: 'Settings',
            componentName: 'template',
            componentState: { id: 'settings' },
          },
          {
            type: 'component',
            isClosable: true,
            title: 'Evidence',
            componentName: 'template',
            componentState: { id: 'evidence' },
          },
          {
            type: 'component',
            isClosable: false,
            title: 'Log',
            componentName: 'template',
            componentState: { id: 'log' },
          },
          {
            type: 'component',
            isClosable: false,
            title: 'Help',
            componentName: 'template',
            componentState: { id: 'help' },
          }],
        },
        {
          type: 'stack',
          width: 30,
          content: [{
            type: 'component',
            isClosable: false,
            title: 'Music',
            componentName: 'template',
            componentState: { id: 'music' },
          },
          {
            type: 'component',
            isClosable: true,
            title: 'Players',
            componentName: 'template',
            componentState: { id: 'players' },
          }],
        }],
      },
      {
        type: 'stack',
        content: [{
          type: 'component',
          isClosable: false,
          title: 'OOC',
          componentName: 'template',
          componentState: { id: 'ooc' },
        },
        {
          type: 'component',
          isClosable: true,
          title: 'About',
          componentName: 'template',
          componentState: { id: 'about' },
        }],
      }],
    }],
  }],
};


const configMobile = {
  settings: {
    showPopoutIcon: false,
    showCloseIcon: false,
  },
  dimensions: {
    minItemHeight: 40,
  },
  content: [{
    type: 'row',
    content: [{
      type: 'column',
      content: [{
        type: 'component',
        isClosable: false,
        reorderEnabled: false,
        componentName: 'template',
        title: 'IC',
        componentState: { id: 'client_wrapper' },
        height: 56 // Adjust the height proportion as needed
      },
      {
        type: 'stack',
        height: 44,
        content: [{
          type: 'component',
          isClosable: false,
          reorderEnabled: false,
          title: 'IC Options',
          componentName: 'template',
          componentState: { id: 'icoptions' },
        },
        {
          type: 'component',
          isClosable: false,
          reorderEnabled: false,
          title: 'Main',
          componentName: 'template',
          componentState: { id: 'mainmenu' },
        },
        {
          type: 'component',
          isClosable: false,
          reorderEnabled: false,
          title: 'Log',
          componentName: 'template',
          componentState: { id: 'log' },
        },
        {
          type: 'component',
          isClosable: false,
          reorderEnabled: false,
          title: 'Music',
          componentName: 'template',
          componentState: { id: 'music' },
        },
        {
          type: 'component',
          isClosable: true,
          title: 'Players',
          componentName: 'template',
          componentState: { id: 'players' },
        },
        {
          type: 'component',
          isClosable: false,
          reorderEnabled: false,
          title: 'OOC',
          componentName: 'template',
          componentState: { id: 'ooc' },
        }]
      }]
    }]
  }]
}


const isMobileDevice = window.innerWidth <= window.innerHeight;

const golden = new GoldenLayout();
golden.registerComponentFactoryFunction('template', (container, componentState) => {
  const template = document.querySelector(`#${componentState.id}`);
  container.element.innerHTML = template.innerHTML;
});
if (isMobileDevice) {
  golden.loadLayout(configMobile);
}
else {
  golden.loadLayout(config);
}

console.log(golden.root.contentItems[0].contentItems[0].contentItems[0]);

golden.root.contentItems[0].contentItems[0].contentItems[0].on('resize', function () {
  console.log("IC pane resized");  //TEMP
  console.log(golden.root.contentItems[0].contentItems[0]);
});