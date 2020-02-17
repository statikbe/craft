const defaultTheme = require("tailwindcss/defaultTheme");

const colorShade = require("./tailoff/tailwind/color-shades");
const underlineAnimation = require("./tailoff/tailwind/underline-animation");
const breakOut = require("./tailoff/tailwind/break-out");
const button = require("./tailoff/tailwind/button");
const aspectRatio = require("tailwindcss-aspect-ratio");

const siteColors = {
  primary: {
    default: "#EE4737",
    contrast: "#ffffff"
  },
  secondary: {
    default: "#00ff00",
    contrast: "#ffffff"
  }
};

module.exports = {
  theme: {
    borderWidth: {
      default: "1px",
      "0": "0",
      "1": "1px",
      "2": "2px",
      "3": "3px"
    },
    container: {
      center: true
    },
    fontFamily: {
      accent: ["serif"],
      base: ["sans-serif"]
    },
    screens: {
      sm: "660px",
      md: "820px",
      lg: "980px",
      xl: "1200px"
    },
    colors: {
      ...defaultTheme.colors,
      ...siteColors
    },
    aspectRatio: {
      none: 0,
      square: [1, 1],
      "16/9": [16, 9],
      "4/3": [4, 3],
      "21/9": [21, 9]
    },
    extend: {
      boxShadow: {
        card: "0 0 30px 0 rgba(0,0,0,0.15)"
      }
    }
  },
  variants: {},
  plugins: [
    colorShade(siteColors),
    underlineAnimation,
    breakOut,
    aspectRatio,
    button({ borderRadius: 4 })
  ]
};
