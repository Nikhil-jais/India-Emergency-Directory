/* =========================================================
   🇮🇳 INDIA EMERGENCY DIRECTORY
   MAIN APPLICATION SCRIPT
   Version 2.0 — Civic Service Experience
   ========================================================= */

"use strict";

/* =========================================================
   1. APPLICATION CONFIGURATION
   ========================================================= */

const APP_CONFIG = {
    appName: "TN India Emergency Directory",
    version: "2.0",
    nationalData: "data/national.json",
    statesData: "data/states.json",

    storageKeys: {
        state: "indiaEmergency.selectedState",
        favourites: "indiaEmergency.favourites",
        theme: "indiaEmergency.theme",
        welcomeSeen: "indiaEmergency.welcomeSeen"
    },

    defaultCategory: "All",
    defaultSort: "recommended"
};


/* =========================================================
   2. DOM ELEMENTS
   ========================================================= */

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const stateSelect = $("#stateSelect");
const contactsContainer = $("#contactsContainer");

const searchInput = $("#searchInput");
const heroSearchInput = $("#heroSearchInput");
const heroSearchButton = $("#heroSearchButton");

const clearSearch = $("#clearSearch");
const clearFilters = $("#clearFilters");
const resetSearch = $("#resetSearch");

const categoryButtons = $$(".category-button");

const contactCount = $("#contactCount");
const activeFilterText = $("#activeFilterText");

const sortButton = $("#sortButton");
const viewToggle = $("#viewToggle");

const statContacts = $("#statContacts");
const statStates = $("#statStates");
const statCategories = $("#statCategories");

const selectedStateText = $("#selectedStateText");

const menuButton = $("#menuButton");
const mobileNav = $("#mobileNav");

const backToTop = $("#backToTop");

const exploreStatesButton = $("#exploreStatesButton");

const noResults = $("#noResults");


/* =========================================================
   3. APPLICATION STATE
   ========================================================= */

let contacts = [];
let states = [];

let selectedCategory = APP_CONFIG.defaultCategory;
let selectedState = "";
let currentSearch = "";

let currentSort = APP_CONFIG.defaultSort;

let currentView = "grid";

let favourites = loadFavourites();

let applicationReady = false;


/* =========================================================
   4. CATEGORY ICONS
   ========================================================= */

const CATEGORY_ICONS = {
    "Emergency": "🚨",
    "Police": "👮",
    "Medical": "🚑",
    "Fire": "🚒",
    "Fire & Rescue": "🚒",
    "Women": "🛡️",
    "Children": "🧒",
    "Cyber Crime": "💻",
    "Government Services": "🏛️",
    "Railways": "🚆",
    "Consumer": "⚖️",
    "Disaster Management": "🌊",
    "Disaster": "🌊",
    "Senior Citizens": "🧓",
    "Disability Support": "♿",
    "Passport & Travel": "🛂",
    "Education": "🎓",
    "Tourism": "🧭",
    "Food Safety": "🍱",
    "Gas & LPG": "🔥",
    "Road Safety": "🚗",
    "Public Safety": "🛡️",
    "Identity & Aadhaar": "🪪",
    "Government Welfare": "🏛️",
    "Health": "❤️",
    "Banking": "🏦",
    "Human Rights": "⚖️"
};


/* =========================================================
   5. AVAILABILITY SYSTEM
   ========================================================= */

function getAvailabilityInfo(availability, category) {

    const value = String(availability || "").toLowerCase();

    /*
       We deliberately don't pretend that every service is
       continuously operational unless the data says so.
    */

    if (
        value.includes("24/7") ||
        value.includes("24×7") ||
        value.includes("24 x 7") ||
        value.includes("round the clock")
    ) {
        return {
            label: "Available 24/7",
            className: "status-available",
            icon: "●",
            priority: 1
        };
    }

    if (
        value.includes("check") ||
        value.includes("official")
    ) {
        return {
            label: "Verify availability",
            className: "status-verify",
            icon: "●",
            priority: 3
        };
    }

    if (
        value.includes("working hours") ||
        value.includes("office hours")
    ) {
        return {
            label: "Office hours",
            className: "status-limited",
            icon: "●",
            priority: 2
        };
    }

    /*
       Emergency categories receive a distinct visual status.
       This does not claim a service is operational unless the
       underlying data supports it.
    */

    if (
        category === "Emergency" ||
        category === "Police" ||
        category === "Fire" ||
        category === "Medical"
    ) {
        return {
            label: "Emergency service",
            className: "status-emergency",
            icon: "●",
            priority: 1
        };
    }

    return {
        label: availability || "Check official source",
        className: "status-verify",
        icon: "●",
        priority: 3
    };
}


/* =========================================================
   6. APP LAUNCH / SPLASH EXPERIENCE
   ========================================================= */

function showAppSplash() {

    const splash = document.getElementById("appSplash");

    if (!splash) {
        revealApplication();
        return;
    }

    document.body.classList.add("splash-active");

    setTimeout(() => {

        splash.classList.add("splash-closing");

        setTimeout(() => {

            splash.remove();

            document.body.classList.remove("splash-active");

            revealApplication();

        }, 700);

    }, 2800);
}


function revealApplication() {

    document.body.classList.add(
        "application-visible"
    );

    setTimeout(() => {

        document.body.classList.add(
            "application-loaded"
        );

    }, 50);
}


/* =========================================================
   7. LOAD STATES
   ========================================================= */

async function loadStates() {

    if (!stateSelect) return;

    try {

        const response =
            await fetch(APP_CONFIG.statesData);

        if (!response.ok) {
            throw new Error(
                "Unable to load states.json"
            );
        }

        states = await response.json();

        stateSelect.innerHTML = `
            <option value="">
                🇮🇳 National / All India
            </option>
        `;

        states.forEach(state => {

            if (!state || !state.id) return;

            const option =
                document.createElement("option");

            option.value = state.id;

            option.textContent =
                `${state.name} — ${state.type}`;

            stateSelect.appendChild(option);
        });

        /*
           Restore previously selected state.
        */

        const savedState =
            localStorage.getItem(
                APP_CONFIG.storageKeys.state
            );

        if (
            savedState &&
            states.some(state => state.id === savedState)
        ) {

            stateSelect.value = savedState;

            selectedState = savedState;

            updateSelectedStateLabel();
        }

    } catch (error) {

        console.error(
            "State loading error:",
            error
        );

        stateSelect.innerHTML = `
            <option value="">
                🇮🇳 National / All India
            </option>
        `;
    }
}


/* =========================================================
   8. LOAD NATIONAL CONTACTS
   ========================================================= */

async function loadNationalContacts() {

    showLoadingState(
        "Loading national services",
        "Preparing verified directory information..."
    );

    try {

        const response =
            await fetch(APP_CONFIG.nationalData);

        if (!response.ok) {

            throw new Error(
                "Unable to load national.json"
            );
        }

        contacts =
            await response.json();

        updateStatistics();

        applyFilters();

    } catch (error) {

        console.error(
            "National contacts error:",
            error
        );

        showErrorState();
    }
}


/* =========================================================
   9. LOAD STATE CONTACTS
   ========================================================= */

async function loadStateContacts(stateId) {

    const stateName =
        getStateName(stateId);

    showLoadingState(
        `Loading ${stateName}`,
        "Checking available state-specific services..."
    );

    try {

        /*
           State-specific files are expected to be located at:
           data/states/{stateId}.json
        */

        const response =
            await fetch(
                `data/states/${stateId}.json`
            );

        if (!response.ok) {
            throw new Error(
                "State-specific file unavailable"
            );
        }

        contacts =
            await response.json();

        updateStatistics();

        applyFilters();

    } catch (error) {

        console.warn(
            `No state contact file found for ${stateId}.`,
            error
        );

        /*
           Instead of displaying a broken page,
           show a useful state profile.
        */

        contacts =
            createStateFallbackContacts(stateId);

        updateStatistics();

        applyFilters();

        showStateFallbackNotice(stateName);
    }
}


/* =========================================================
   10. STATE FALLBACK SERVICES
   ========================================================= */

function createStateFallbackContacts(stateId) {

    const state =
        states.find(
            item => item.id === stateId
        );

    if (!state) return [];

    return [

        {
            id: `${stateId}-112`,
            name: "Integrated Emergency Response",
            category: "Emergency",
            phone: "112",
            description:
                "Pan-India emergency response route for police, fire, medical and other urgent assistance.",
            availability: "24/7",
            scope: state.name,
            verified: true,
            icon: "🚨"
        },

        {
            id: `${stateId}-profile`,
            name: `${state.name} Government Directory`,
            category: "Government Services",
            phone: "",
            description:
                `Explore government departments, district services and public-service information for ${state.name}.`,
            availability: "Check official source",
            scope: state.name,
            verified: true,
            icon: "🏛️"
        }

    ];
}


function showStateFallbackNotice(stateName) {

    const notice =
        document.createElement("div");

    notice.className =
        "state-fallback-notice";

    notice.innerHTML = `
        <span class="notice-icon">ℹ️</span>

        <div>
            <strong>
                ${escapeHTML(stateName)} directory
            </strong>

            <p>
                State-specific contact records are
                not available in the local data yet.
                The directory is showing the common
                emergency route and state profile instead.
            </p>
        </div>

        <button
            type="button"
            class="notice-close"
            aria-label="Close notice"
        >
            ×
        </button>
    `;

    contactsContainer.parentElement?.prepend(notice);

    const closeButton =
        notice.querySelector(".notice-close");

    closeButton?.addEventListener(
        "click",
        () => notice.remove()
    );

    setTimeout(() => {

        if (notice.isConnected) {
            notice.classList.add("notice-hidden");

            setTimeout(
                () => notice.remove(),
                400
            );
        }

    }, 7000);
}


/* =========================================================
   11. FILTER SYSTEM
   ========================================================= */

function applyFilters() {

    if (!Array.isArray(contacts)) {
        contacts = [];
    }

    currentSearch =
        String(
            searchInput?.value || ""
        )
            .toLowerCase()
            .trim();

    let filtered =
        contacts.filter(contact => {

            /*
               CATEGORY
            */

            const categoryMatches =
                selectedCategory === "All" ||
                normalizeCategory(contact.category) ===
                normalizeCategory(selectedCategory);

            if (!categoryMatches) {
                return false;
            }

            /*
               SEARCH
            */

            if (!currentSearch) {
                return true;
            }

            const searchableText = [

                contact.name,
                contact.category,
                contact.description,
                contact.phone,
                contact.scope,
                contact.availability

            ]
                .map(value =>
                    String(value || "")
                        .toLowerCase()
                )
                .join(" ");

            return searchableText.includes(
                currentSearch
            );
        });

    /*
       Sorting
    */

    filtered =
        sortContacts(filtered);

    updateFilterUI(filtered);

    displayContacts(filtered);
}


/* =========================================================
   12. SORTING
   ========================================================= */

function sortContacts(list) {

    const copy =
        [...list];

    switch (currentSort) {

        case "name":

            return copy.sort(
                (a, b) =>
                    String(a.name || "")
                        .localeCompare(
                            String(b.name || "")
                        )
            );

        case "category":

            return copy.sort(
                (a, b) =>
                    String(a.category || "")
                        .localeCompare(
                            String(b.category || "")
                        )
            );

        case "emergency":

            return copy.sort(
                (a, b) =>
                    getAvailabilityInfo(
                        b.availability,
                        b.category
                    ).priority -
                    getAvailabilityInfo(
                        a.availability,
                        a.category
                    ).priority
            );

        case "recommended":
        default:

            return copy.sort(
                (a, b) => {

                    const aPriority =
                        a.verified ? 0 : 1;

                    const bPriority =
                        b.verified ? 0 : 1;

                    return aPriority - bPriority;
                }
            );
    }
}


/* =========================================================
   13. DISPLAY CONTACTS
   ========================================================= */

function displayContacts(list) {

    if (!contactsContainer) return;

    contactsContainer.innerHTML = "";

    if (!list || list.length === 0) {

        showNoResults();

        return;
    }

    hideNoResults();

    list.forEach(
        (contact, index) => {

            const card =
                createContactCard(
                    contact,
                    index
                );

            contactsContainer.appendChild(
                card
            );
        }
    );

    updateContactCount(list.length);

    /*
       Apply current view.
    */

    contactsContainer.dataset.view =
        currentView;
}


/* =========================================================
   14. CREATE CONTACT CARD
   ========================================================= */

function createContactCard(contact, index) {

    const card =
        document.createElement("article");

    card.className =
        "contact-card";

    card.style.setProperty(
        "--card-index",
        index
    );

    const category =
        contact.category ||
        "General";

    const icon =
        contact.icon ||
        getCategoryIcon(category);

    const availability =
        getAvailabilityInfo(
            contact.availability,
            category
        );

    const phone =
        String(
            contact.phone || ""
        );

    const isFavourite =
        favourites.includes(
            String(
                contact.id ||
                contact.phone ||
                contact.name
            )
        );

    const contactId =
        String(
            contact.id ||
            contact.phone ||
            contact.name
        );

    card.innerHTML = `

        <div class="contact-card-top">

            <div class="contact-icon">
                ${icon}
            </div>

            <button
                type="button"
                class="favourite-button ${
                    isFavourite
                        ? "is-favourite"
                        : ""
                }"
                data-contact-id="${escapeAttribute(contactId)}"
                aria-label="${
                    isFavourite
                        ? "Remove from favourites"
                        : "Add to favourites"
                }"
                title="${
                    isFavourite
                        ? "Remove favourite"
                        : "Save service"
                }"
            >
                ${isFavourite ? "★" : "☆"}
            </button>

        </div>

        <div class="contact-category">
            ${escapeHTML(category)}
        </div>

        <h3 class="contact-name">
            ${escapeHTML(
                contact.name ||
                "Unnamed service"
            )}
        </h3>

        <div class="contact-number">

            ${
                phone
                    ? `
                        <span class="phone-label">
                            Contact
                        </span>

                        <strong>
                            ${escapeHTML(phone)}
                        </strong>
                    `
                    : `
                        <span class="phone-label">
                            Directory
                        </span>

                        <strong>
                            Government service
                        </strong>
                    `
            }

        </div>

        <p class="contact-description">
            ${escapeHTML(
                contact.description ||
                "Public-service information."
            )}
        </p>

        <div class="contact-meta">

            <span class="availability-badge ${
                availability.className
            }">

                <span class="status-dot">
                    ${availability.icon}
                </span>

                ${escapeHTML(
                    availability.label
                )}

            </span>

            ${
                contact.verified
                    ? `
                        <span class="verified-badge">
                            ✓ Verified source
                        </span>
                    `
                    : ""
            }

        </div>

        ${
            contact.scope
                ? `
                    <div class="contact-scope">
                        📍 ${escapeHTML(
                            contact.scope
                        )}
                    </div>
                `
                : ""
        }

        <div class="contact-actions">

            ${
                phone
                    ? `
                        <a
                            class="call-button"
                            href="tel:${cleanPhone(phone)}"
                            data-phone="${escapeAttribute(phone)}"
                        >
                            <span>📞</span>
                            Call Now
                        </a>

                        <button
                            type="button"
                            class="secondary-action copy-button"
                            data-phone="${escapeAttribute(phone)}"
                            title="Copy number"
                        >
                            ⧉
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="secondary-action disabled-action"
                            disabled
                        >
                            No direct number
                        </button>
                    `
            }

            <button
                type="button"
                class="secondary-action share-button"
                data-name="${escapeAttribute(
                    contact.name || ""
                )}"
                data-phone="${escapeAttribute(phone)}"
                title="Share service"
            >
                ↗
            </button>

        </div>
    `;

    attachCardEvents(
        card,
        contact,
        contactId
    );

    return card;
}


/* =========================================================
   15. CARD INTERACTIONS
   ========================================================= */

function attachCardEvents(
    card,
    contact,
    contactId
) {

    const favouriteButton =
        card.querySelector(
            ".favourite-button"
        );

    favouriteButton?.addEventListener(
        "click",
        () => {

            toggleFavourite(
                contactId
            );

            const isNowFavourite =
                favourites.includes(
                    contactId
                );

            favouriteButton.classList.toggle(
                "is-favourite",
                isNowFavourite
            );

            favouriteButton.textContent =
                isNowFavourite
                    ? "★"
                    : "☆";

            favouriteButton.setAttribute(
                "aria-label",
                isNowFavourite
                    ? "Remove from favourites"
                    : "Add to favourites"
            );

            showToast(
                isNowFavourite
                    ? "Saved to favourites"
                    : "Removed from favourites",
                isNowFavourite
                    ? "success"
                    : "info"
            );
        }
    );

    const copyButton =
        card.querySelector(
            ".copy-button"
        );

    copyButton?.addEventListener(
        "click",
        async () => {

            const phone =
                copyButton.dataset.phone;

            await copyToClipboard(
                phone
            );
        }
    );

    const shareButton =
        card.querySelector(
            ".share-button"
        );

    shareButton?.addEventListener(
        "click",
        async () => {

            const name =
                shareButton.dataset.name;

            const phone =
                shareButton.dataset.phone;

            await shareService(
                name,
                phone
            );
        }
    );

    const callButton =
        card.querySelector(
            ".call-button"
        );

    callButton?.addEventListener(
        "click",
        () => {

            /*
               On supported mobile devices the tel:
               link opens the phone application.
            */

            showToast(
                `Opening ${contact.name || "service"}...`,
                "info"
            );
        }
    );
}


/* =========================================================
   16. FAVOURITES
   ========================================================= */

function loadFavourites() {

    try {

        const saved =
            localStorage.getItem(
                APP_CONFIG.storageKeys.favourites
            );

        const parsed =
            saved
                ? JSON.parse(saved)
                : [];

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch {

        return [];
    }
}


function saveFavourites() {

    localStorage.setItem(
        APP_CONFIG.storageKeys.favourites,
        JSON.stringify(favourites)
    );
}


function toggleFavourite(id) {

    if (favourites.includes(id)) {

        favourites =
            favourites.filter(
                item => item !== id
            );

    } else {

        favourites.push(id);
    }

    saveFavourites();
}


/* =========================================================
   17. SEARCH
   ========================================================= */

function performSearch(value) {

    const cleanValue =
        String(value || "").trim();

    if (searchInput) {
        searchInput.value =
            cleanValue;
    }

    if (heroSearchInput) {
        heroSearchInput.value =
            cleanValue;
    }

    applyFilters();

    if (cleanValue) {

        scrollToDirectory();
    }
}


function clearAllSearch() {

    if (searchInput) {
        searchInput.value = "";
    }

    if (heroSearchInput) {
        heroSearchInput.value = "";
    }

    applyFilters();
}


/* =========================================================
   18. CATEGORY ICON
   ========================================================= */

function getCategoryIcon(category) {

    return (
        CATEGORY_ICONS[category] ||
        "📞"
    );
}


/* =========================================================
   19. CATEGORY FILTER EVENTS
   ========================================================= */

categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            categoryButtons.forEach(
                btn =>
                    btn.classList.remove(
                        "active"
                    )
            );

            button.classList.add(
                "active"
            );

            selectedCategory =
                button.dataset.category ||
                "All";

            applyFilters();

            scrollToDirectory();
        }
    );
});


/* =========================================================
   20. STATE SELECTION
   ========================================================= */

stateSelect?.addEventListener(
    "change",
    async () => {

        selectedState =
            stateSelect.value;

        localStorage.setItem(
            APP_CONFIG.storageKeys.state,
            selectedState
        );

        selectedCategory =
            "All";

        currentSort =
            APP_CONFIG.defaultSort;

        resetCategoryButtons();

        clearAllSearch();

        updateSelectedStateLabel();

        if (!selectedState) {

            await loadNationalContacts();

            return;
        }

        await loadStateContacts(
            selectedState
        );

        scrollToDirectory();
    }
);


/* =========================================================
   21. UPDATE SELECTED STATE
   ========================================================= */

function updateSelectedStateLabel() {

    if (!selectedStateText) return;

    if (!selectedState) {

        selectedStateText.textContent =
            "Showing national services across India";

        return;
    }

    const state =
        states.find(
            item =>
                item.id === selectedState
        );

    if (!state) {

        selectedStateText.textContent =
            "Showing selected location";

        return;
    }

    selectedStateText.textContent =
        `Showing services for ${state.name}`;
}


/* =========================================================
   22. RESET CATEGORY
   ========================================================= */

function resetCategoryButtons() {

    categoryButtons.forEach(
        button =>
            button.classList.remove(
                "active"
            )
    );

    const allButton =
        [...categoryButtons]
            .find(
                button =>
                    button.dataset.category ===
                    "All"
            );

    allButton?.classList.add(
        "active"
    );
}


/* =========================================================
   23. SORT BUTTON
   ========================================================= */

sortButton?.addEventListener(
    "click",
    () => {

        const modes = [
            "recommended",
            "name",
            "category",
            "emergency"
        ];

        const currentIndex =
            modes.indexOf(
                currentSort
            );

        currentSort =
            modes[
                (currentIndex + 1) %
                modes.length
            ];

        updateSortButton();

        applyFilters();
    }
);


function updateSortButton() {

    if (!sortButton) return;

    const labels = {

        recommended:
            "Recommended",

        name:
            "Name A–Z",

        category:
            "Category",

        emergency:
            "Priority"

    };

    sortButton.textContent =
        `↕ ${labels[currentSort]}`;
}


/* =========================================================
   24. VIEW TOGGLE
   ========================================================= */

viewToggle?.addEventListener(
    "click",
    () => {

        currentView =
            currentView === "grid"
                ? "list"
                : "grid";

        contactsContainer.dataset.view =
            currentView;

        viewToggle.textContent =
            currentView === "grid"
                ? "☷"
                : "▦";

        viewToggle.setAttribute(
            "aria-label",
            currentView === "grid"
                ? "Switch to list view"
                : "Switch to grid view"
        );
    }
);


/* =========================================================
   25. SEARCH EVENTS
   ========================================================= */

searchInput?.addEventListener(
    "input",
    () => {

        if (heroSearchInput) {

            heroSearchInput.value =
                searchInput.value;
        }

        applyFilters();
    }
);


heroSearchInput?.addEventListener(
    "input",
    () => {

        if (searchInput) {

            searchInput.value =
                heroSearchInput.value;
        }
    }
);


heroSearchInput?.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            performSearch(
                heroSearchInput.value
            );
        }
    }
);


heroSearchButton?.addEventListener(
    "click",
    () => {

        performSearch(
            heroSearchInput?.value
        );
    }
);


clearSearch?.addEventListener(
    "click",
    clearAllSearch
);


clearFilters?.addEventListener(
    "click",
    () => {

        selectedCategory = "All";

        currentSort =
            APP_CONFIG.defaultSort;

        resetCategoryButtons();

        clearAllSearch();

        updateSortButton();
    }
);


resetSearch?.addEventListener(
    "click",
    () => {

        selectedCategory = "All";

        currentSort =
            APP_CONFIG.defaultSort;

        resetCategoryButtons();

        clearAllSearch();

        updateSortButton();

        hideNoResults();
    }
);


/* =========================================================
   26. SUGGESTION CHIPS
   ========================================================= */

$$(".suggestion-chip").forEach(
    chip => {

        chip.addEventListener(
            "click",
            () => {

                const value =
                    chip.dataset.search ||
                    chip.textContent.trim();

                performSearch(value);
            }
        );
    }
);


/* =========================================================
   27. MOBILE NAVIGATION
   ========================================================= */

menuButton?.addEventListener(
    "click",
    () => {

        const isOpen =
            mobileNav?.classList.toggle(
                "is-open"
            );

        menuButton.setAttribute(
            "aria-expanded",
            String(!!isOpen)
        );

        document.body.classList.toggle(
            "nav-open",
            !!isOpen
        );
    }
);


$$(
    "#mobileNav a, #mobileNav button"
).forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                mobileNav?.classList.remove(
                    "is-open"
                );

                document.body.classList.remove(
                    "nav-open"
                );

                menuButton?.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        );
    }
);


/* =========================================================
   28. SCROLL TO DIRECTORY
   ========================================================= */

function scrollToDirectory() {

    const directory =
        $("#directory");

    if (!directory) return;

    setTimeout(() => {

        directory.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);
}


/* =========================================================
   29. EXPLORE STATES
   ========================================================= */

exploreStatesButton?.addEventListener(
    "click",
    () => {

        const locationSection =
            $("#location");

        if (locationSection) {

            locationSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }
);


/* =========================================================
   30. BACK TO TOP
   ========================================================= */

window.addEventListener(
    "scroll",
    () => {

        if (!backToTop) return;

        backToTop.classList.toggle(
            "visible",
            window.scrollY > 500
        );
    },
    {
        passive: true
    }
);


backToTop?.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* =========================================================
   31. STATISTICS
   ========================================================= */

function updateStatistics() {

    if (statContacts) {

        animateNumber(
            statContacts,
            contacts.length
        );
    }

    if (statStates) {

        animateNumber(
            statStates,
            states.length || 36
        );
    }

    if (statCategories) {

        const categories =
            new Set(
                contacts
                    .map(
                        contact =>
                            contact.category
                    )
                    .filter(Boolean)
            );

        animateNumber(
            statCategories,
            categories.size
        );
    }
}


function animateNumber(
    element,
    target
) {

    if (!element) return;

    const finalNumber =
        Number(target) || 0;

    const duration = 700;

    const startTime =
        performance.now();

    function update(time) {

        const progress =
            Math.min(
                (time - startTime) /
                duration,
                1
            );

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );

        element.textContent =
            Math.round(
                finalNumber * eased
            );

        if (progress < 1) {

            requestAnimationFrame(
                update
            );
        }
    }

    requestAnimationFrame(
        update
    );
}


/* =========================================================
   32. FILTER UI
   ========================================================= */

function updateFilterUI(list) {

    if (activeFilterText) {

        let text =
            selectedCategory === "All"
                ? "All services"
                : selectedCategory;

        if (currentSearch) {

            text +=
                ` · Search: "${currentSearch}"`;
        }

        activeFilterText.textContent =
            text;
    }

    updateContactCount(
        list.length
    );
}


function updateContactCount(count) {

    if (!contactCount) return;

    contactCount.textContent =
        `${count} service${
            count === 1
                ? ""
                : "s"
        } available`;
}


/* =========================================================
   33. NO RESULTS
   ========================================================= */

function showNoResults() {

    contactsContainer.innerHTML = "";

    if (noResults) {

        noResults.classList.add(
            "visible"
        );

        return;
    }

    contactsContainer.innerHTML = `

        <div class="empty-message">

            <div class="empty-icon">
                🔎
            </div>

            <h3>
                No matching services
            </h3>

            <p>
                Try another search term,
                category or location.
            </p>

            <button
                type="button"
                class="empty-reset"
                id="generatedResetButton"
            >
                Reset search
            </button>

        </div>
    `;

    $("#generatedResetButton")
        ?.addEventListener(
            "click",
            () => {

                selectedCategory =
                    "All";

                resetCategoryButtons();

                clearAllSearch();
            }
        );

    updateContactCount(0);
}


function hideNoResults() {

    noResults?.classList.remove(
        "visible"
    );
}


/* =========================================================
   34. LOADING STATE
   ========================================================= */

function showLoadingState(
    title,
    message
) {

    if (!contactsContainer) return;

    contactsContainer.innerHTML = `

        <div class="directory-loading">

            <div class="loading-orbit">

                <span></span>
                <span></span>
                <span></span>

            </div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>
    `;
}


/* =========================================================
   35. ERROR STATE
   ========================================================= */

function showErrorState() {

    if (contactCount) {

        contactCount.textContent =
            "Unable to load contacts";
    }

    if (!contactsContainer) return;

    contactsContainer.innerHTML = `

        <div class="empty-message error-state">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Directory data could not be loaded
            </h3>

            <p>
                Please check that the data files are
                present and refresh the page.
            </p>

            <button
                type="button"
                class="empty-reset"
                onclick="window.location.reload()"
            >
                Refresh directory
            </button>

        </div>
    `;
}


/* =========================================================
   36. TOAST NOTIFICATIONS
   ========================================================= */

function showToast(
    message,
    type = "info"
) {

    let container =
        $("#toastContainer");

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "toastContainer";

        document.body.appendChild(
            container
        );
    }

    const toast =
        document.createElement("div");

    toast.className =
        `directory-toast toast-${type}`;

    const icons = {

        success: "✓",
        info: "ℹ",
        warning: "!",
        error: "×"

    };

    toast.innerHTML = `

        <span class="toast-icon">
            ${icons[type] || "ℹ"}
        </span>

        <span>
            ${escapeHTML(message)}
        </span>

    `;

    container.appendChild(
        toast
    );

    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );
        }
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

        setTimeout(
            () => toast.remove(),
            300
        );

    }, 2800);
}


/* =========================================================
   37. COPY PHONE NUMBER
   ========================================================= */

async function copyToClipboard(
    value
) {

    if (!value) return;

    try {

        await navigator.clipboard.writeText(
            value
        );

        showToast(
            `${value} copied to clipboard`,
            "success"
        );

    } catch {

        /*
           Fallback for older browsers.
        */

        const temporary =
            document.createElement(
                "textarea"
            );

        temporary.value =
            value;

        document.body.appendChild(
            temporary
        );

        temporary.select();

        document.execCommand(
            "copy"
        );

        temporary.remove();

        showToast(
            "Contact number copied",
            "success"
        );
    }
}


/* =========================================================
   38. SHARE SERVICE
   ========================================================= */

async function shareService(
    name,
    phone
) {

    const shareText =
        phone
            ? `${name} — ${phone}`
            : `${name} — India Emergency Directory`;

    if (
        navigator.share
    ) {

        try {

            await navigator.share({
                title:
                    "India Emergency Directory",
                text:
                    shareText,
                url:
                    window.location.href
            });

            return;

        } catch (error) {

            /*
               User cancelled share.
            */

            if (
                error?.name ===
                "AbortError"
            ) {
                return;
            }
        }
    }

    await copyToClipboard(
        shareText
    );

    showToast(
        "Service details copied for sharing",
        "info"
    );
}


/* =========================================================
   39. STATE NAME
   ========================================================= */

function getStateName(
    stateId
) {

    const state =
        states.find(
            item =>
                item.id === stateId
        );

    return state
        ? state.name
        : "Selected State";
}


/* =========================================================
   40. NORMALIZE CATEGORY
   ========================================================= */

function normalizeCategory(
    value
) {

    return String(
        value || ""
    )
        .toLowerCase()
        .replace(
            /&/g,
            "and"
        )
        .replace(
            /[^a-z0-9]+/g,
            ""
        );
}


/* =========================================================
   41. CLEAN PHONE
   ========================================================= */

function cleanPhone(
    phone
) {

    return String(
        phone || ""
    )
        .replace(
            /[^0-9+]/g,
            ""
        );
}


/* =========================================================
   42. HTML SECURITY HELPERS
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );
}


/* =========================================================
   43. KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
           "/" focuses the search box.
        */

        if (
            event.key === "/" &&
            document.activeElement?.tagName !==
            "INPUT" &&
            document.activeElement?.tagName !==
            "TEXTAREA"
        ) {

            event.preventDefault();

            searchInput?.focus();
        }

        /*
           Escape clears search.
        */

        if (
            event.key === "Escape"
        ) {

            if (
                document.activeElement ===
                searchInput
            ) {

                clearAllSearch();

                searchInput.blur();
            }

            mobileNav?.classList.remove(
                "is-open"
            );

            document.body.classList.remove(
                "nav-open"
            );
        }
    }
);


/* =========================================================
   44. ONLINE / OFFLINE STATUS
   ========================================================= */

function updateConnectionStatus() {

    const online =
        navigator.onLine;

    document.body.classList.toggle(
        "offline-mode",
        !online
    );

    if (!online) {

        showToast(
            "You are offline. Previously loaded information may still be available.",
            "warning"
        );
    }
}


window.addEventListener(
    "online",
    () => {

        document.body.classList.remove(
            "offline-mode"
        );

        showToast(
            "Connection restored",
            "success"
        );
    }
);


window.addEventListener(
    "offline",
    updateConnectionStatus
);


/* =========================================================
   45. PAGE VISIBILITY
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            /*
               Re-check connection when user
               returns to the page.
            */

            updateConnectionStatus();
        }
    }
);


/* =========================================================
   46. INITIALIZE APPLICATION
   ========================================================= */

async function initializeApp() {

    console.log(
        "🇮🇳 India Emergency Directory starting..."
    );

    /*
       Initial UI state
    */

    document.body.classList.add(
        "application-initializing"
    );

    updateConnectionStatus();

    updateSortButton();

    /*
       Load the data first.
    */

    await loadStates();

    if (selectedState) {

        await loadStateContacts(
            selectedState
        );

    } else {

        await loadNationalContacts();
    }

    applicationReady = true;

    document.body.classList.remove(
        "application-initializing"
    );

    document.body.classList.add(
        "application-ready"
    );

    /*
       Welcome screen.
    */

   
    console.log(
        "🇮🇳 India Emergency Directory loaded successfully."
    );
}


/* =========================================================
   47. START APPLICATION
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initializeApp();
            initializeWelcomeExperience();

        }
    );

} else {

    initializeApp();
    initializeWelcomeExperience();

}


/* =========================================================
   48. WELCOME EXPERIENCE
   ========================================================= */

function initializeWelcomeExperience() {

    const welcomeOverlay =
        document.getElementById("welcomeOverlay");

    const welcomeEnter =
        document.getElementById("welcomeEnter");

    if (!welcomeOverlay || !welcomeEnter) {
        console.warn(
            "Welcome overlay or Enter button not found."
        );
        return;
    }

    document.body.classList.add(
        "welcome-active"
    );

    welcomeEnter.addEventListener(
        "click",
        function () {

            welcomeOverlay.classList.add(
                "welcome-closing"
            );

            document.body.classList.remove(
                "welcome-active"
            );

            setTimeout(
                function () {

                    welcomeOverlay.remove();

                },
                550
            );

        }
    );

}
