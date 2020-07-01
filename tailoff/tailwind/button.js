const plugin = require("tailwindcss/plugin");

const codeBlock = (
    name,
    textColor,
    textColorHover,
    bgColor,
    bgColorHover,
    borderColor,
    borderColorHover,
    underline,
    underlineHover,
    extraProperties,
    extraPropertiesHover,
    e
) => {
    return {
        [`.${e(`btn--${name}`)}`]: {
            color: textColor,
            "background-color": bgColor,
            "border-color": borderColor,
            "text-decoration": underline ? "underline" : "none",
            ...extraProperties,
        },
        [`.${e(`btn--${name}`)}:hover`]: {
            color: textColorHover,
            "background-color": bgColorHover,
            "border-color": borderColorHover,
            "text-decoration": underlineHover
                ? "underline !important"
                : "none !important",
            ...extraPropertiesHover,
        },
    };
};

module.exports = plugin.withOptions(function (options) {
    return function ({ addComponents, e, theme, variants }) {
        const defaultStyles = {
            primary: {
                "text-color": theme("colors.primary.contrast"),
                "bg-color": theme("colors.primary.500"),
                "bg-color-hover": theme("colors.primary.700"),
                "underline-hover": false,
                "extra-properties": {},
                "extra-properties-hover": {},
            },
            "primary-inverse": {
                "text-color": theme("colors.primary.500"),
                "text-color-hover": theme("colors.primary.contrast"),
                "bg-color": theme("colors.primary.contrast"),
                "bg-color-hover": theme("colors.primary.700"),
                "underline-hover": false,
                "extra-properties": {},
                "extra-properties-hover": {},
            },
            secondary: {
                "text-color": theme("colors.secondary.contrast"),
                "bg-color": theme("colors.secondary.500"),
                "bg-color-hover": theme("colors.secondary.700"),
                "underline-hover": false,
                "extra-properties": {},
                "extra-properties-hover": {},
            },
            "secondary-inverse": {
                "text-color": theme("colors.secondary.500"),
                "text-color-hover": theme("colors.primary.contrast"),
                "bg-color": theme("colors.secondary.contrast"),
                "bg-color-hover": theme("colors.secondary.700"),
                "underline-hover": false,
                "extra-properties": {},
                "extra-properties-hover": {},
            },
            ghost: {
                "text-color": theme("colors.primary.500"),
                "text-color-hover": theme("colors.white"),
                "bg-color": theme("colors.transparent"),
                "bg-color-hover": theme("colors.primary.500"),
                "border-color": theme("colors.primary.500"),
                "underline-hover": false,
                "extra-properties": {},
                "extra-properties-hover": {},
            },
            "ghost-inverse": {
                "text-color": theme("colors.white"),
                "text-color-hover": theme("colors.primary.500"),
                "bg-color": theme("colors.transparent"),
                "bg-color-hover": theme("colors.white"),
                "border-color": theme("colors.white"),
                "underline-hover": false,
                "extra-properties": {},
                "extra-properties-hover": {},
            },
            link: {
                "text-color": theme("colors.secondary.500"),
                "text-color-hover": theme("colors.black"),
                "bg-color": "transparent",
                underline: true,
                "underline-hover": false,
                "extra-properties": {},
                "extra-properties-hover": {},
            },
            download: {
                "text-color": theme("colors.primary.contrast"),
                "bg-color": theme("colors.primary.500"),
                "bg-color-hover": theme("colors.primary.700"),
                "underline-hover": false,
                "extra-properties": {},
                "extra-properties-hover": {},
            },
        };

        const buttonStyles = theme("button", defaultStyles);
        options = {
            ...{
                borderWidth: 2,
                borderRadius: 0,
                pill: false,
                px: 4,
                py: 2,
                transition: "200ms",
                extIcon: theme("icons.arrow-right"),
                defaultIcon: false,
                iconAnimation: true,
                generalProperties: {},
            },
            ...options,
        };

        let component = {
            ".btn": {
                display: "inline-block",
                "line-height": 1,
                "border-width": options.borderWidth,
                "border-radius": options.pill ? "999px" : options.borderRadius,
                "padding-top": theme(`spacing.${options.py}`),
                "padding-bottom": theme(`spacing.${options.py}`),
                "padding-left": theme(`spacing.${options.px}`),
                "padding-right": theme(`spacing.${options.px}`),
                "transition-property":
                    "background-color, border-color, color, fill, stroke, opacity, box-shadow, -webkit-transform, transform",
                "transition-timing-function": "ease-in-out",
                "transition-duration": options.transition,
                ...options.generalProperties,
            },
            ".btn::after": {
                "transition-property":
                    "background-color, border-color, color, fill, stroke, opacity, box-shadow, -webkit-transform, transform",
                "transition-timing-function": "ease-in-out",
                "transition-duration": options.transition,
                ...(options.defaultIcon
                    ? {
                          ...theme("iconBlock"),
                          content: `"\\f${options.extIcon.trim()}"`,
                          "margin-left": theme(`spacing.1`),
                      }
                    : {}),
            },
            ".btn--ext::after": {
                ...theme("iconBlock"),
                content: `"\\f${options.extIcon.trim()}"`,
                "margin-left": theme(`spacing.1`),
            },
            ".btn--download::before": {
                ...theme("iconBlock"),
                content: `'\\f${theme("icons.download").trim()}'`,
                "margin-right": theme(`spacing.1`),
                "font-size": "21px",
                "line-height": "16px",
            },
            ...(options.iconAnimation
                ? {
                      ".btn--ext:hover::after": {
                          transform: "translateX(50%)",
                      },
                  }
                : {}),
        };
        for (let [name, properties] of Object.entries(buttonStyles)) {
            component = {
                ...component,
                ...codeBlock(
                    name,
                    properties["text-color"],
                    properties["text-color-hover"]
                        ? properties["text-color-hover"]
                        : properties["text-color"],
                    properties["bg-color"],
                    properties["bg-color-hover"]
                        ? properties["bg-color-hover"]
                        : properties["bg-color"],
                    properties["border-color"]
                        ? properties["border-color"]
                        : properties["bg-color"],
                    properties["border-color-hover"]
                        ? properties["border-color-hover"]
                        : properties["bg-color-hover"]
                        ? properties["bg-color-hover"]
                        : properties["bg-color"],
                    properties["underline"] ? properties["underline"] : false,
                    properties["underline-hover"]
                        ? properties["underline-hover"]
                        : false,
                    properties["extra-properties"]
                        ? properties["extra-properties"]
                        : {},
                    properties["extra-properties-hover"]
                        ? properties["extra-properties-hover"]
                        : {},
                    e
                ),
            };
        }

        addComponents(component);
    };
});
