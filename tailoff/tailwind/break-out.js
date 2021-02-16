const plugin = require("tailwindcss/plugin");

const codeBlock = (name, value, e) => {
    const val1 = value * (50 / value);
    const val2 = 50 - value;
    const base = 50;
    return {
        [`.${e(`break-out-left-${name}`)}`]: {
            "margin-left": `calc(-${base}vw + ${val1}%)`,
            // flex: `0 0 calc(${base}vw - ${val2}%)` //IE 11 can't handle this but flex: 1 works
            flex: `1`
        },
        [`.${e(`break-out-right-${name}`)}`]: {
            "margin-right": `calc(-${base}vw + ${val1}%)`,
            // flex: `0 0 calc(${base}vw - ${val2}%)` //IE 11 can't handle this but flex: 1 works
            flex: `1`
        }
    };
};

module.exports = plugin(function({ addUtilities, e, theme, variants }) {
    const breakoutSizes = theme("breakOut", {
        "1/2": 50,
        "1/3": 33.33,
        "1/4": 25,
        "1/5": 20,
        "2/5": 40
    });
    const breakOutVariants = variants("breakOut", ["responsive"]);

    let util = {
        ".break-out-full-ignore": {
            "margin-right": "auto",
            "margin-left": "auto",
            left: "auto",
            right: "auto",
            width: "auto",
        },
        ".break-out-full": {
            left: "50%",
            "margin-left": "-50vw",
            "margin-right": "-50vw",
            "max-width": "100vw",
            position: "relative",
            right: "50%",
            width: "100vw"
        }
    };
    for (let [name, value] of Object.entries(breakoutSizes)) {
        util = {
            ...util,
            ...codeBlock(name, value, e)
        };
    }

    addUtilities(util, breakOutVariants);
});
