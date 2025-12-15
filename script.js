
import { Scheme, argbFromHex, themeFromImage, applyTheme } from "https://esm.run/@material/material-color-utilities";

import '@material/web/all.js';
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';

const tabMap = [
    "site",
    "docs",
    "matugen"
]

document.adoptedStyleSheets.push(typescaleStyles.styleSheet);

async function applyDynamicTheme() {
    const img = document.getElementById("themeImage");
    const theme = await themeFromImage(img);
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    applyTheme(theme, { dark: systemDark });
}

function switchPage(btn) {
    const content = document.getElementById("pageContent");
    const divider = document.getElementById("headerDivider");

    const page = btn.dataset.page;
    const template = document.getElementById(page);

    if (content) {
        content.innerHTML = "";
        content.appendChild(template.content.cloneNode(true));
    }

    divider.style.visibility = "visible";
    addCopyButtonsToHeaders()
    Prism.highlightAllUnder(content);
}

function attachPageListeners() {
    const buttons = document.querySelectorAll(".button-row md-outlined-button, .button-row md-filled-button");

    buttons.forEach(btn => {
        btn.addEventListener("click", e => {
            switchPage(btn)
            console.log(btn.dataset.hash)

            if (btn.dataset.fakeClick === 'true') {
                return
            };

            location.hash = btn.dataset.hash;
        });
    });
}

async function switchTab(index) {
    const tabName = tabMap[index]

    const template = document.getElementById(tabName);
    const content = document.getElementById("bodyDiv");
    content.innerHTML = "";

    await content.appendChild(template.content.cloneNode(true));
    applyDynamicTheme()
    attachPageListeners()
    addCopyButtonsToHeaders()

    if (content) Prism.highlightAllUnder(content);
}

function handleHash(hash) {
    if (!hash) {
        location.hash = "#site"
        return
    };

    const tabs = document.getElementById("headerTabs");
    const path = hash.slice(1);
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) return;

    const tabName = parts[0];
    const tabMap = { site: 0, docs: 1, matugen: 2 };
    const tabIndex = tabMap[tabName] ?? 1;

    tabs.activeTabIndex = tabIndex / tabIndex;

    switchTab(tabIndex).then(() => {
        if (parts.length === 1) return;

        const intermediateButtons = parts.slice(1, -1);
        const lastPart = parts[parts.length - 1];

        let i = 0;
        const clickNextButton = () => {
            if (i >= intermediateButtons.length) {
                clickLastPart();
                return;
            }

            const btn = document.querySelector(`[data-button="${intermediateButtons[i]}"]`);
            if (btn) {
                fakeClick(btn);
                i++;
                setTimeout(clickNextButton, 40);
            }
        };

        clickNextButton();

        function clickLastPart() {
            const lastBtn = document.querySelector(`[data-button="${lastPart}"]`);

            if (lastBtn) {
                fakeClick(lastBtn);

                setTimeout(() => {
                    const header = document.getElementById(lastPart);
                    if (header) {
                        header.scrollIntoView({ behavior: "smooth", block: 'center' });
                    }
                }, 60);
            } else {
                const header = document.getElementById(lastPart);
                if (header) {
                    header.scrollIntoView({
                        behavior: "smooth", block: 'center'
                    });
                    flash(header)
                }
            }
        }
    });
}

function flash(element) {
    setTimeout(function () { element.style.animation = "flash 0.3s 2 alternate ease-out"; }, 100);

    element.style.animation = "";
}

function fakeClick(btn) {
    btn.dataset.fakeClick = 'true';
    btn.click();
    delete btn.dataset.fakeClick;
}

function addCopyButtonsToHeaders(container = document) {
    container.querySelectorAll('h2, h3, h4').forEach(header => {
        if (header.querySelector('.header-copy-btn')) return;

        if (!header.id) {
            header.id = header.textContent.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');
        }

        const btn = document.createElement('md-text-button');
        btn.className = 'header-copy-btn';

        const icon = document.createElement('md-icon');
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/></svg>
        `;

        btn.appendChild(icon);

        btn.addEventListener('click', () => {

            const url = `${location.origin}${location.pathname}${location.hash}/${header.id}`;

            navigator.clipboard.writeText(url).then(() => {
                icon.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                `;
                setTimeout(() => {
                    icon.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/></svg>
                    `;
                }, 1000);
            });
        });

        header.prepend(btn);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    handleHash(location.hash)

    const topButtons = document.querySelectorAll("header md-filled-tonal-button, header md-text-button")

    topButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            switch (btn.dataset.page) {
                case "profile":
                    location.href = "https://www.github.com/InioX/";
                    break;
                case "contact":
                    switchPage(btn)
                    break;
                case "repo":
                    location.href = "https://www.github.com/InioX/iniox.github.io";
                    break;
            }
        })
    })

    const backToTop = document.getElementById("to-top")

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    })

    const tabs = document.getElementById("headerTabs");

    tabs.addEventListener('change', (event) => {
        const index = event.target.activeTabIndex;
        switchTab(index);

        const tabName = tabMap[index] ?? "site";
        location.hash = `#${tabName}`;
    });

    window.addEventListener("hashchange", e => {
        console.log(location.hash);
        handleHash(location.hash);
    });
});