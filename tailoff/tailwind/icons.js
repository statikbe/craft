const plugin = require("tailwindcss/plugin");

const { fontName, icons } = require("./icons.json");
const iconBlock = {
    display: "inline-block",
    border: "none",
    "font-family": `'${fontName}'`,
    "font-weight": "normal",
    "font-style": "normal",
    "font-size": "inherit",
    "line-height": "inherit",
    "text-indent": "0",
    "text-transform": "none",
    "vertical-align": "middle",
    "text-rendering": "auto",
    transform: "translate(0, 0)",
    "text-decoration": "none"
};

const iconBlockCode = (name, content, e) => {
    return {
        [`.${e(`icon--${name}`)}::before`]: {
            content: `"\\f${content.trim()}"`
        },
        [`.${e(`apply-icon--${name}`)}`]: {
            content: `"\\f${content.trim()}"`
        }
    };
};

module.exports = plugin.withOptions(
    function(options) {
        return function({ addComponents, e, theme, variants }) {
            let component = {
                "@font-face": {
                    "font-family": fontName,
                    src: `url("../fonts/icons.eot")`,
                    src: `url("../fonts/icons.eot?#iefix") format("embedded-opentype"),
                          url("../fonts/icons.woff2") format("woff2"),
                          url("../fonts/icons.woff") format("woff"),
                          url("../fonts/icons.ttf") format("truetype")`,
                    "font-weight": "normal",
                    "font-style": "normal"
                },
                ".icon::before": iconBlock,
                ".apply-icon": iconBlock
            };

            for (let [name, content] of Object.entries(icons)) {
                component = {
                    ...component,
                    ...iconBlockCode(name, content, e)
                };
            }

            addComponents(component);
        };
    },
    function(options) {
        return {
            theme: {
                iconBlock: iconBlock,
                icons: icons
            }
        };
    }
);
