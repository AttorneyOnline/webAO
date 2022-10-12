const getResources = (AO_HOST, THEME) => ({
  holdit: {
    src: `${AO_HOST}misc/default/holdit_bubble.png`,
    duration: 720,
  },
  objection: {
    src: `${AO_HOST}misc/default/objection_bubble.png`,
    duration: 720,
  },
  takethat: {
    src: `${AO_HOST}misc/default/takethat_bubble.png`,
    duration: 840,
  },
  custom: {
    src: '',
    duration: 840,
  },
  witnesstestimony: {
    src: `${AO_HOST}themes/${THEME}/witnesstestimony_bubble.gif`,
    duration: 1560,
    sfx: `${AO_HOST}sounds/general/sfx-testimony.opus`,
  },
  crossexamination: {
    src: `${AO_HOST}themes/${THEME}/crossexamination_bubble.gif`,
    duration: 1600,
    sfx: `${AO_HOST}sounds/general/sfx-testimony2.opus`,
  },
  guilty: {
    src: `${AO_HOST}themes/${THEME}/guilty_bubble.gif`,
    duration: 2870,
    sfx: `${AO_HOST}sounds/general/sfx-guilty.opus`,
  },
  notguilty: {
    src: `${AO_HOST}themes/${THEME}/notguilty_bubble.gif`,
    duration: 2440,
    sfx: `${AO_HOST}sounds/general/sfx-notguilty.opus`,
  },
});
export default getResources;
