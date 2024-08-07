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
        isClosable: false,
        componentName: 'template',
        title: 'Game',
        componentState: { id: 'client_wrapper' },
      }],
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
            title: 'Main',
            componentName: 'template',
            componentState: { id: 'mainmenu' },
          },
          {
            type: 'component',
            isClosable: false,
            title: 'Log',
            componentName: 'template',
            componentState: { id: 'log' },
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
            isClosable: false,
            title: 'Players',
            componentName: 'template',
            componentState: { id: 'players' },
          }],
        }],
      },
      {
        type: 'row',
        content: [{
          type: 'component',
          title: 'Server chat',
          componentName: 'template',
          componentState: { id: 'ooc' },
        }],
      }],
    }],
  }],
};

const golden = new GoldenLayout();
golden.registerComponentFactoryFunction('template', (container, componentState) => {
  const template = document.querySelector(`#${componentState.id}`);
  container.element.innerHTML = template.innerHTML;
});
golden.loadLayout(config);
