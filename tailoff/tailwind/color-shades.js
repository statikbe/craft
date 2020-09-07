// my-plugin.js
const plugin = require("tailwindcss/plugin");

const shadeGenerator = {
    tints: {
        100: 0.9,
        200: 0.75,
        300: 0.6,
        400: 0.3,
    },
    shades: {
        600: 0.9,
        700: 0.6,
        800: 0.45,
        900: 0.3,
    },
    hexPart: (c) => `0${c.toString(16)}`.slice(-2),
    hexToRgb(hex) {
        const components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
            hex
        );
        if (!components) {
            return null;
        }
        return {
            r: parseInt(components[1], 16),
            g: parseInt(components[2], 16),
            b: parseInt(components[3], 16),
        };
    },
    rgbToHex(r, g, b) {
        return `#${this.hexPart(r)}${this.hexPart(g)}${this.hexPart(b)}`;
    },
    tint(hex, intensity) {
        const color = this.hexToRgb(hex),
            r = Math.round(color.r + (255 - color.r) * intensity),
            g = Math.round(color.g + (255 - color.g) * intensity),
            b = Math.round(color.b + (255 - color.b) * intensity);
        return this.rgbToHex(r, g, b);
    },
    shade(hex, intensity) {
        const color = this.hexToRgb(hex),
            r = Math.round(color.r * intensity),
            g = Math.round(color.g * intensity),
            b = Math.round(color.b * intensity);
        return this.rgbToHex(r, g, b);
    },
    getTextColor(color) {
        const { r, g, b } = this.hexToRgb(color.replace(/#/gi, "")),
            luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 120 ? "#FFFFFF" : "#333333";
    },
    generate(colorName, color) {
        // Reset the colors
        let colors = [];
        const name = colorName.replace(/\s/gi, "-");
        // Tints
        for (const key in this.tints) {
            const tint = this.tints[key],
                tinted = this.tint(color, tint),
                label = key;
            colors.push({
                name: `${name}-${key}`,
                label,
                background: tinted,
                text: this.getTextColor(tinted),
            });
        }

        const label = "500";
        // Base
        colors.push({
            name: `${name}-${label}`,
            label,
            background: color,
            text: this.getTextColor(color),
        });
        // Shades
        for (const key in this.shades) {
            const shade = this.shades[key],
                shaded = this.shade(color, shade),
                label = key;
            colors.push({
                name: `${name}-${key}`,
                label,
                background: shaded,
                text: this.getTextColor(shaded),
            });
        }

        return colors;
    },
};

module.exports = plugin.withOptions(
    function (options) {},
    function (options) {
        const colors = {};
        for (let [color, modifiers] of Object.entries(options)) {
            colors[color] = {};
            for (let [modifier, value] of Object.entries(modifiers)) {
                if (modifier == "default") {
                    const shades = shadeGenerator.generate(color, value);
                    for (let [key, shade] of Object.entries(shades)) {
                        if (!colors[color][shade.label]) {
                            colors[color][shade.label] = shade.background;
                        }
                    }
                }
                colors[color][modifier] = value;
            }
        }

        return {
            theme: {
                extend: {
                    colors: colors,
                },
            },
        };
    }
);
