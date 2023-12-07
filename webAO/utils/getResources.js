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
        html: `<p id='testimony1' class='testimony_anim wt' style='top: 30%;animation: from_left 1560ms linear 1;'>Witness</p><p id='testimony2' class='testimony_anim wt' style='top: 50%;animation: from_right 1560ms linear 1;'>Testimony</p>`,
        duration: 1560,
        sfx: `${AO_HOST}sounds/general/sfx-testimony.opus`,
    },
    crossexamination: {
        html: `<p id='testimony1' class='testimony_anim ce'>Cross</p><p id='testimony2' class='testimony_anim ce'>Examination</p>`,
        duration: 1600,
        sfx: `${AO_HOST}sounds/general/sfx-testimony2.opus`,
    },
    guilty: {
        html: `<p id='testimony1' class='guilty'>G</p><p id='testimony2' class='guilty'>u</p>
               <p id='testimony3' class='guilty'>i</p><p id='testimony4' class='guilty'>l</p>
               <p id='testimony5' class='guilty'>t</p><p id='testimony6' class='guilty'>y</p>`,
        duration: 2870,
        sfx: `${AO_HOST}sounds/general/sfx-guilty.opus`,
    },
    notguilty: {
        html: `<p id='testimony1' class='ng'>Not</p><p id='testimony2' class='ng'>Guilty</p>`,
        duration: 2440,
        sfx: `${AO_HOST}sounds/general/sfx-notguilty.opus`,
    },
    testimony: {
        html: `<p id='testimony1' class='testimony'>Testimony</p>`,
        duration: 0,
        sfx: ``,
    },
});
export default getResources;
