import GoldenLayout from "./golden/js/goldenlayout.js";

var config = {
    settings: {
        showPopoutIcon: false
    },
    content: [
    {
        type: "row",
        content: [
        {
            type: "component",
            componentName: "template",
            componentState: { id: "client_wrapper" }
        },
        {
            type: "column",
            content: [
            {
                type: "component",
                componentName: "template",
                componentState: { id: "ooc" }
            },
            {
                type: "component",
                componentName: "template",
                componentState: { id: "music" }
            }]
        }]
    }]
};

var golden = new GoldenLayout(config);
golden.registerComponent("template", function(container, componentState) {
    container.getElement().html(document.querySelector("#" + componentState.id).content);
});
golden.init();
console.log("initializing");