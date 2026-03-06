
import { applyDynamicTheme, renderTheme, toggleDarkMode, isDarkMode } from './md3.js';

import '@material/web/all.js';
import { styles as typescaleStyles } from '@material/web/typography/md-typescale-styles.js';

const tabMap = [
    "site",
    "docs",
    "matugen"
]

let currentTab = null;
let isProgrammaticNavigation = false;


const templateCache = {};

async function loadTemplate(path) {
    if (templateCache[path]) return templateCache[path];

    const response = await fetch(`./templates/${path}.html`);

    const html = await response.text();

    // console.log(html)

    const temp = document.createElement('template');
    temp.innerHTML = html;
    templateCache[path] = temp;
    return temp;
}

document.adoptedStyleSheets.push(typescaleStyles.styleSheet);

async function switchPage(btn) {
    toggleLoading(true);

    const content = document.getElementById("pageContent");
    const divider = document.getElementById("headerDivider");

    if (!btn.dataset.hash) { return }

    const page = btn.dataset.hash.slice(1);

    if (page === "matugen") { return }

    const fullPath = "./" + page

    const template = await loadTemplate(fullPath);

    if (content) {
        content.innerHTML = "";
        content.appendChild(template.content.cloneNode(true));
    }

    divider.style.visibility = "visible";
    addCopyButtonsToHeaders()

    if (content) {
        generateTOC(content);
        Prism.highlightAllUnder(content);
    }

    toggleLoading(false);
}

function attachPageListeners() {
    const buttons = document.querySelectorAll(".button-row md-outlined-button, .button-row md-filled-button, .header-left md-filled-button");

    buttons.forEach(async btn => {
        btn.addEventListener("click", e => {

            switchPage(btn)

            if (isProgrammaticNavigation) {
                return
            };

            location.hash = btn.dataset.hash;
        });
    });

    const mode = document.getElementById("change-mode-button")

    if (mode) {
        mode.addEventListener("click", () => {
            toggleDarkMode()
            renderTheme();
            updateModeButton();
        });
    }
}

function updateModeButton() {
    const modeBtn = document.getElementById("change-mode-button");
    if (!modeBtn) return;

    const icon = modeBtn.querySelector('svg');

    if (isDarkMode()) {
        icon.innerHTML = `<path d="M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-226.5 56.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/>`;
    } else {
        icon.innerHTML = `<path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z"/>`
    }

    modeBtn.append(icon);
}

async function switchTab(index) {
    toggleLoading(true);

    if (currentTab === index) return;
    currentTab = index;

    const tabName = `${tabMap[index]}Template`;

    const template = document.getElementById(tabName);
    const content = document.getElementById("bodyDiv");
    content.innerHTML = "";

    await content.appendChild(template.content.cloneNode(true));
    attachPageListeners()
    addCopyButtonsToHeaders()
    updateModeButton()

    if (content) {
        generateTOC(content);
        Prism.highlightAllUnder(content);
    }

    applyDynamicTheme().catch(console.error).then(() => {
        toggleLoading(false);
    });
}

async function handleHash(hash) {
    if (!hash) {
        location.hash = "#site"
        return
    };

    const path = hash.slice(1);
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) return;

    const tabName = parts[0];
    const tabMap = { site: 0, docs: 1, matugen: 2 };
    const tabIndex = tabMap[tabName] ?? 1;

    document.querySelectorAll("#headerTabs").forEach((tabs) => {
        tabs.activeTabIndex = tabIndex / tabIndex;
    })

    await switchTab(tabIndex)

    requestAnimationFrame(() => {
        if (parts.length === 1) return;

        const intermediateButtons = parts.slice(1, -1);
        const lastPart = parts[parts.length - 1];

        let i = 0;
        const clickNextButton = () => {
            if (i >= intermediateButtons.length) {
                setTimeout(() => {
                    const header = document.getElementById(lastPart);
                    const lastBtn = !header ? document.querySelector(`[data-button="${lastPart}"]`) : null;

                    if (lastBtn) {
                        fakeClick(lastBtn);
                        setTimeout(async () => {
                            const newHeader = await document.getElementById(lastPart);
                            if (newHeader) {
                                newHeader.scrollIntoView({ behavior: "smooth", block: 'center' });
                                flash(newHeader);
                            }
                        }, 150);
                    } else if (header) {
                        header.scrollIntoView({ behavior: "smooth", block: 'center' });
                        flash(header);
                    }
                }, 100);
                return;
            }

            const btn = document.querySelector(`[data-button="${intermediateButtons[i]}"]`);
            if (btn) {
                fakeClick(btn);
                i++;
                setTimeout(clickNextButton, 100);
            }
        };

        clickNextButton();
    });
};

function toggleLoading(show) {
    const bar = document.getElementById("loading-bar");
    if (!bar) return;

    if (show) {
        if (bar.hideTimeout) clearTimeout(bar.hideTimeout);

        bar.style.display = "block";
        requestAnimationFrame(() => {
            bar.classList.add("visible");
        });
    } else {
        bar.hideTimeout = setTimeout(() => {
            bar.classList.remove("visible");

            setTimeout(() => {
                if (!bar.classList.contains('visible')) {
                    bar.style.display = "none";
                }
            }, 300);
        }, 600);
    }
}

function flash(element) {
    element.style.animation = "flash 0.8s ease-in-out 2";

    setTimeout(() => {
        element.style.animation = "none";
    }, 2000);
}

function fakeClick(btn) {
    isProgrammaticNavigation = true;
    btn.click();
    isProgrammaticNavigation = false;
}

function addCopyButtonsToHeaders(container = document) {
    container.querySelectorAll('h2, h3, h4').forEach(header => {
        if (header.querySelector('.header-copy-btn')) return;

        if (header.hasAttribute('data-no-copy')) return;

        if (!header.id) {
            header.id = header.textContent.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');
        }

        const baseHash = getBaseHash();
        const btn = document.createElement('md-text-button');
        btn.className = 'header-copy-btn';

        const icon = document.createElement('md-icon');
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/></svg>
        `;

        btn.appendChild(icon);

        btn.addEventListener('click', () => {


            const url = `${location.origin}${baseHash}/${header.id}`;

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

function generateTOC(root = document) {
    const container = root.querySelector(".doc-page");
    const tocRoot = root.querySelector("#toc ul");

    if (!container || !tocRoot) return;

    tocRoot.innerHTML = "";

    const headers = container.querySelectorAll("h2, h3, h4");

    let currentH2 = null;
    let currentH3 = null;

    const baseHash = getBaseHash();

    headers.forEach((header) => {
        if (!header.id) {
            header.id = header.textContent
                .toLowerCase()
                .replace(/[^\w]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }

        if (header.id === "table-of-contents") {
            return;
        }

        const link = document.createElement("a");
        link.href = `${baseHash}/${header.id}`;
        link.textContent = header.textContent;

        const li = document.createElement("li");
        li.appendChild(link);

        switch (header.tagName) {
            case "H2": {
                const ul = document.createElement("ul");
                li.appendChild(ul);
                tocRoot.appendChild(li);
                currentH2 = ul;
                currentH3 = null;
                break;
            }

            case "H3": {
                if (!currentH2) return;
                const ul = document.createElement("ul");
                li.appendChild(ul);
                currentH2.appendChild(li);
                currentH3 = ul;
                break;
            }

            case "H4": {
                if (!currentH3) return;
                currentH3.appendChild(li);
                break;
            }
        }
    });
}

function getBaseHash() {
    const parts = location.hash.replace("#", "").split("/").filter(Boolean);

    const base = parts.slice(0, 2).join("/");

    return `#${base}`;
}

document.addEventListener("DOMContentLoaded", () => {
    handleHash(location.hash)

    const backToTop = document.getElementById("to-top")

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    })

    document.querySelectorAll("#headerTabs").forEach((tabs) => {
        tabs.addEventListener('change', (event) => {
            const index = event.target.activeTabIndex;

            const tabName = tabMap[index] ?? "site";
            location.hash = `#${tabName}`;
        });
    });

    const phone_tabs = document.querySelector(".header-tabs-phone");
    const divider = phone_tabs.shadowRoot.querySelector('md-divider');
    if (divider) {
        divider.style.display = 'none';
    }

    window.addEventListener("hashchange", e => {
        handleHash(location.hash);
    });

    const toTopBtn = document.getElementById("to-top");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 200) {
            toTopBtn.classList.add("visible");
        } else {
            toTopBtn.classList.remove("visible");
        }
    });
});