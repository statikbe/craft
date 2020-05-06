const plugin = require("tailwindcss/plugin");

const codeBlock = (
    name,
    textColor,
    textColorHover,
    bgColor,
    bgColorHover,
    borderColor,
    borderColorHover,
    e
) => {
    return {
        [`.${e(`btn--${name}`)}`]: {
            color: textColor,
            "background-color": bgColor,
            "border-color": borderColor,
        },
        [`.${e(`btn--${name}`)}:hover`]: {
            color: textColorHover,
            "background-color": bgColorHover,
            "border-color": borderColorHover,
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
            },
            "primary-inverse": {
                "text-color": theme("colors.primary.500"),
                "text-color-hover": theme("colors.primary.contrast"),
                "bg-color": theme("colors.primary.contrast"),
                "bg-color-hover": theme("colors.primary.700"),
            },
            secondary: {
                "text-color": theme("colors.secondary.contrast"),
                "bg-color": theme("colors.secondary.500"),
                "bg-color-hover": theme("colors.secondary.700"),
            },
            "secondary-inverse": {
                "text-color": theme("colors.secondary.500"),
                "text-color-hover": theme("colors.primary.contrast"),
                "bg-color": theme("colors.secondary.contrast"),
                "bg-color-hover": theme("colors.secondary.700"),
            },
            ghost: {
                "text-color": theme("colors.black"),
                "text-color-hover": theme("colors.white"),
                "bg-color": theme("colors.transparent"),
                "bg-color-hover": theme("colors.black"),
                "border-color": theme("colors.black"),
            },
            link: {
                "text-color": theme("colors.primary.500"),
                "text-color-hover": theme("colors.black"),
                "bg-color": "transparent",
                underline: true,
                "underline-hover": false,
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
                    e
                ),
            };
        }

        addComponents(component);
    };
});
