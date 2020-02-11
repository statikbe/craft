const plugin = require("tailwindcss/plugin");

const codeBlock = (colorName, color, e, width) => {
    return {
        [`.${e(`underline-ani-${colorName}`)}`]: {
            "background-image": `linear-gradient(to right, ${color}, ${color})`,
            "background-repeat": `no-repeat`,
            "background-position": `center bottom`,
            "background-size": `0 ${width}px`,
            transition: `background 200ms ease-in-out`
        },
        [`.${e(`underline-ani-${colorName}`)}:hover`]: {
            "background-size": `100% ${width}px`
        }
    };
};

module.exports = plugin.withOptions(function(options) {
    return function({ addComponents, e, theme, variants }) {
        options = {
            ...{
                width: 2
            },
            ...options
        };

        let component = {};
        for (let [name, color] of Object.entries(theme("colors"))) {
            if (typeof color === "string") {
                component = {
                    ...component,
                    ...codeBlock(name, color, e, options.width)
                };
            } else {
                for (let [modifier, value] of Object.entries(color)) {
                    component = {
                        ...component,
                        ...codeBlock(
                            `${name}-${modifier}`,
                            value,
                            e,
                            options.width
                        )
                    };
                }
            }
        }

        addComponents(component, variants("underlineAnimationColor"));
    };
});
