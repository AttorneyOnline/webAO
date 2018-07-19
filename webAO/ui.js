import GoldenLayout from "./golden/js/goldenlayout.js";

var config = {
    settings: {
        showPopoutIcon: false,
        showCloseIcon: false
    },
    dimensions: {
        minItemHeight: 40
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
                        componentName: "template",
                        title: "Game",
                        componentState: { id: "client_wrapper" }
                    },
                    {
                        type: "component",
                        title: "Miscellaneous",
                        height: 5,
                        componentName: "template",
                        componentState: { id: "misc" }
                    },
                ]
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
										title: "Main",
										componentName: "template",
										componentState: { id: "mainmenu" }
									},
									{
										type: "component",
										title: "Log",
										componentName: "template",
										componentState: { id: "log" }
									}
								]
							},
							{
								type: "component",
								title: "Server chat",
								width: 30,
								componentName: "template",
								componentState: { id: "ooc" }
							}
						]
                    },
                    {
                        type: "row",
                        content: [
                            {
                                type: "component",
                                title: "Music",
                                componentName: "template",
                                componentState: { id: "music" }
                            },
                            {
                                type: "stack",
                                content: [
                                    {
                                        type: "component",
                                        title: "Settings",
                                        componentName: "template",
                                        componentState: { id: "client_settings" }
                                    },
                                    {
                                        type: "component",
                                        title: "About",
                                        componentName: "template",
                                        componentState: { id: "about" }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }]
};

var golden = new GoldenLayout(config);
golden.registerComponent("template", function(container, componentState) {
    let template = document.querySelector(`#${componentState.id}`);
    container.getElement().html(template.content);
    // TODO: support multiple locales
    // container.setTitle(document.querySelector(`#${componentState.id} meta[name='frame-title']`).getAttribute("content"));
});
golden.init();