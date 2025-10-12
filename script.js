
import { Scheme, argbFromHex, themeFromImage, applyTheme } from "https://esm.run/@material/material-color-utilities";

import '@material/web/all.js';
import {styles as typescaleStyles} from '@material/web/typography/md-typescale-styles.js';

document.adoptedStyleSheets.push(typescaleStyles.styleSheet);

async function applyDynamicTheme() {
    const img = document.getElementById("themeImage");
    const theme = await themeFromImage(img);
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    applyTheme(theme, {  dark: systemDark});
}

applyDynamicTheme();

function switchPage(btn) {
    const pages = {
        about: document.getElementById("aboutPage"),
        projects: document.getElementById("projectsPage"),
        other: document.getElementById("otherPage"),
        contact: document.getElementById("contactPage")
    };
    const content = document.getElementById("pageContent");
    const divider = document.getElementById("headerDivider");
    const arrow = document.getElementById("headerArrow");

    const page = btn.dataset.page;
    const template = pages[page];
    content.innerHTML = "";
    arrow.style.visibility = "visible";
    divider.style.visibility = "visible";
    content.appendChild(template.content.cloneNode(true));
}

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".button-row md-outlined-button, .button-row md-filled-button");
    
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            switchPage(btn)
        });
    });

    const topButtons = document.querySelectorAll("header md-filled-tonal-button, header md-text-button")

    topButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            console.log(btn.dataset.page)

            switch (btn.dataset.page) {
                case "profile":
                    location.href = "https://www.github.com/InioX/";
                    break;
                case "contact":
                    switchPage(btn)
                    break;
                case "repo":
                    location.href = "https://www.github.com/InioX/profile";
                    break;
            }
        })
    })
});