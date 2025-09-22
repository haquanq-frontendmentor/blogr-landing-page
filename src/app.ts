import { listenToMediaQuery } from "./utils/listenToMediaQuery";
import { requestAnimationFrameAfter } from "./utils/requestAnimationFrameAfter";

const matchTabletViewport = listenToMediaQuery("(min-width: 48em)");
const matchPreferReducedMotion = listenToMediaQuery("(prefers-reduced-motion: reduce)");

/* -------------------------------------------------------------------------- */
/*                             SUBMENU / DROPDOWN                             */
/* -------------------------------------------------------------------------- */

const SUBMENU_TRANSITION_DURATION = 300;
const submenuButtons = document.querySelectorAll(".nav__submenu-btn") as NodeListOf<HTMLButtonElement>;
const submenus = document.querySelectorAll(".nav__submenu") as NodeListOf<HTMLDivElement>;
const submenuCancelTransition: Array<(() => void) | null> = [];
let activeSubmenuIndex = -1;

const openSubmenu = (index: number) => {
    const submenu = submenus[index];
    const submenuButton = submenuButtons[index];
    submenuButton.setAttribute("aria-expanded", "true");
    submenu.hidden = false;

    if (activeSubmenuIndex !== -1 && activeSubmenuIndex !== index) closeSubmneu(activeSubmenuIndex);
    activeSubmenuIndex = index;

    if (matchPreferReducedMotion()) {
        return;
    }

    if (matchTabletViewport()) {
        submenu.style.transform = "translateY(16px)";
        submenu.style.opacity = "0";
        submenu.style.transition = "300ms ease";

        requestAnimationFrame(() => {
            submenu.style.transform = "";
            submenu.style.opacity = "";
        });

        return;
    }

    const fromHeight = submenu.clientHeight;
    submenu.removeAttribute("style");
    const toHeight = submenu.clientHeight;

    if (submenuCancelTransition[index]) {
        submenuCancelTransition[index]();
        submenu.style.height = `${fromHeight}px`;
    } else {
        submenu.style.height = "0";
    }

    requestAnimationFrame(() => {
        submenu.style.transition = `height ${SUBMENU_TRANSITION_DURATION}ms ease`;
        submenu.style.height = `${toHeight}px`;
    });
};

const closeSubmneu = (index: number) => {
    const submenu = submenus[index];
    const submenuButton = submenuButtons[index];
    submenuButton.setAttribute("aria-expanded", "false");

    const endTransition = () => {
        submenu.removeAttribute("style");
        submenu.hidden = true;
        submenuCancelTransition[index] = null;
    };

    if (matchPreferReducedMotion() || matchTabletViewport()) {
        endTransition();
        return;
    }

    submenu.style.transition = `height ${SUBMENU_TRANSITION_DURATION}ms ease`;

    if (submenuCancelTransition[index]) submenuCancelTransition[index]();

    submenu.style.height = "0";
    submenuCancelTransition[index] = requestAnimationFrameAfter(SUBMENU_TRANSITION_DURATION, () => {
        endTransition();
    });
};

submenuButtons.forEach((submenuButton, index) => {
    const submenu = submenus[index];

    submenu.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !e.shiftKey) {
            closeSubmneu(index);
            submenuButton.focus();
        }
    });
    submenuButton.addEventListener("click", () => {
        const expanded = submenuButton.getAttribute("aria-expanded") === "true";
        if (expanded) {
            closeSubmneu(index);
        } else {
            openSubmenu(index);
        }
    });
});

/* -------------------------------------------------------------------------- */
/*                                 MOBILE MENU                                */
/* -------------------------------------------------------------------------- */

const mobileMenu = document.querySelector(".nav__menu") as HTMLElement;
const mobileMenuButton = document.querySelector(".nav__menu-btn") as HTMLButtonElement;

let isMenuOpened = () => mobileMenuButton.getAttribute("aria-expanded") === "true";

const openMobileMenu = () => {
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0 });

    mobileMenuButton.setAttribute("aria-expanded", "true");
};

const closeMobileMenu = () => {
    document.body.style.overflow = "";
    mobileMenuButton.setAttribute("aria-expanded", "false");

    if (activeSubmenuIndex !== -1) {
        closeSubmneu(activeSubmenuIndex);
        activeSubmenuIndex = -1;
    }
};

mobileMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    isMenuOpened() ? closeMobileMenu() : openMobileMenu();
});

mobileMenu.addEventListener("click", (event) => {
    event.stopPropagation();
});

window.addEventListener("click", () => {
    if (isMenuOpened()) closeMobileMenu();

    if (matchTabletViewport()) {
        if (activeSubmenuIndex !== -1) {
            closeSubmneu(activeSubmenuIndex);
            activeSubmenuIndex = -1;
        }
    }
});

window.addEventListener("resize", () => {
    if (isMenuOpened() && matchTabletViewport()) closeMobileMenu();
});

window.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
        if (isMenuOpened()) {
            closeMobileMenu();
            requestAnimationFrame(() => {
                mobileMenuButton.focus();
            });
        }

        if (matchTabletViewport()) {
            if (activeSubmenuIndex !== -1) {
                closeSubmneu(activeSubmenuIndex);
                activeSubmenuIndex = -1;
            }
        }
    }
});
