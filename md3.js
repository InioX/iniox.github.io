import {
    themeFromImage,
    Hct,
    hexFromArgb,
    SchemeTonalSpot,
    MaterialDynamicColors,
} from "https://esm.run/@material/material-color-utilities";

let currentTheme = 0xff4285f4;
let _isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

export function toggleDarkMode() {
    _isDarkMode = !_isDarkMode
}

export function isDarkMode() {
    return _isDarkMode
}

export async function applyDynamicTheme() {
    const img = document.getElementById("themeImage");
    if (!img) return;

    await waitForImage(img);

    const theme = await themeFromImage(img);
    currentTheme = theme.source;

    renderTheme();
}

// function renderTheme() {
//     applyTheme(currentTheme, { target: document.body, dark: isDarkMode });
// }

// Without this, using surface-container-* wont work
// https://github.com/material-components/material-web/issues/5099#issuecomment-1809183487
export function renderTheme() {
    if (!currentTheme) return;

    const scheme = new SchemeTonalSpot(
        Hct.fromInt(currentTheme),
        _isDarkMode,
        0
    );

    const tokens = {
        background: MaterialDynamicColors.background,
        "on-background": MaterialDynamicColors.onBackground,
        surface: MaterialDynamicColors.surface,
        "surface-dim": MaterialDynamicColors.surfaceDim,
        "surface-bright": MaterialDynamicColors.surfaceBright,
        "surface-container-lowest": MaterialDynamicColors.surfaceContainerLowest,
        "surface-container-low": MaterialDynamicColors.surfaceContainerLow,
        "surface-container": MaterialDynamicColors.surfaceContainer,
        "surface-container-high": MaterialDynamicColors.surfaceContainerHigh,
        "surface-container-highest": MaterialDynamicColors.surfaceContainerHighest,
        "on-surface": MaterialDynamicColors.onSurface,
        "surface-variant": MaterialDynamicColors.surfaceVariant,
        "on-surface-variant": MaterialDynamicColors.onSurfaceVariant,
        "inverse-surface": MaterialDynamicColors.inverseSurface,
        "inverse-on-surface": MaterialDynamicColors.inverseOnSurface,
        outline: MaterialDynamicColors.outline,
        "outline-variant": MaterialDynamicColors.outlineVariant,
        shadow: MaterialDynamicColors.shadow,
        scrim: MaterialDynamicColors.scrim,
        "surface-tint": MaterialDynamicColors.surfaceTint,
        primary: MaterialDynamicColors.primary,
        "on-primary": MaterialDynamicColors.onPrimary,
        "primary-container": MaterialDynamicColors.primaryContainer,
        "on-primary-container": MaterialDynamicColors.onPrimaryContainer,
        "inverse-primary": MaterialDynamicColors.inversePrimary,
        secondary: MaterialDynamicColors.secondary,
        "on-secondary": MaterialDynamicColors.onSecondary,
        "secondary-container": MaterialDynamicColors.secondaryContainer,
        "on-secondary-container": MaterialDynamicColors.onSecondaryContainer,
        tertiary: MaterialDynamicColors.tertiary,
        "on-tertiary": MaterialDynamicColors.onTertiary,
        "tertiary-container": MaterialDynamicColors.tertiaryContainer,
        "on-tertiary-container": MaterialDynamicColors.onTertiaryContainer,
        error: MaterialDynamicColors.error,
        "on-error": MaterialDynamicColors.onError,
        "error-container": MaterialDynamicColors.errorContainer,
        "on-error-container": MaterialDynamicColors.onErrorContainer,
    };

    let css = ":root{";

    for (const [key, value] of Object.entries(tokens)) {
        const hex = hexFromArgb(value.getArgb(scheme));
        css += `--md-sys-color-${key}:${hex};`;
    }

    css += "}";

    let style = document.getElementById("dynamic-material-theme");

    if (!style) {
        style = document.createElement("style");
        style.id = "dynamic-material-theme";
        document.head.appendChild(style);
    }

    style.textContent = css;
}

async function waitForImage(img) {
    if (img.complete && img.naturalWidth !== 0) {
        return;
    }

    await new Promise((resolve, reject) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", reject, { once: true });
    });
}