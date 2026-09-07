// ==========================================
// INDIA EMERGENCY DIRECTORY
// MAIN APPLICATION
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const stateSelect =
    document.getElementById("stateSelect");

const contactsContainer =
    document.getElementById("contactsContainer");

const searchInput =
    document.getElementById("searchInput");

const contactCount =
    document.getElementById("contactCount");

const categoryButtons =
    document.querySelectorAll(".category-button");


// ==========================================
// APPLICATION DATA
// ==========================================

let contacts = [];

let states = [];

let selectedCategory = "All";


// ==========================================
// LOAD STATES
// ==========================================

async function loadStates() {

    try {

        const response =
            await fetch("data/states.json");


        if (!response.ok) {

            throw new Error(
                "Unable to load states.json"
            );

        }


        states =
            await response.json();


        stateSelect.innerHTML = `
            <option value="">
                🇮🇳 National / All India
            </option>
        `;


        states.forEach(state => {

            const option =
                document.createElement("option");


            option.value =
                state.id;


            option.textContent =
                `${state.name} — ${state.type}`;


            stateSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "State loading error:",
            error
        );


        stateSelect.innerHTML = `
            <option value="">
                Unable to load states
            </option>
        `;

    }

}


// ==========================================
// LOAD NATIONAL CONTACTS
// ==========================================

async function loadNationalContacts() {

    try {

        contactsContainer.innerHTML = `
            <div class="empty-message">
                <h3>Loading contacts...</h3>
                <p>Please wait.</p>
            </div>
        `;


        const response =
            await fetch("data/national.json");


        if (!response.ok) {

            throw new Error(
                "Unable to load national contacts"
            );

        }


        contacts =
            await response.json();


        applyFilters();


    } catch (error) {

        console.error(
            "National contacts error:",
            error
        );


        showError();

    }

}


// ==========================================
// LOAD STATE CONTACTS
// ==========================================

async function loadStateContacts(stateId) {

    try {

        contactsContainer.innerHTML = `
            <div class="empty-message">
                <h3>Loading contacts...</h3>
                <p>Loading ${getStateName(stateId)} services.</p>
            </div>
        `;


        const response =
            await fetch(
                `data/states/${stateId}.json`
            );


        if (!response.ok) {

            throw new Error(
                "State contact file not found"
            );

        }


        contacts =
            await response.json();


        applyFilters();


    } catch (error) {

        console.error(
            "State contacts error:",
            error
        );


        contacts = [];


        contactCount.textContent =
            "No verified contacts available yet";


        contactsContainer.innerHTML = `
            <div class="empty-message">

                <h3>
                    📍 ${getStateName(stateId)}
                </h3>

                <p>
                    State-specific contacts are
                    not available yet.
                </p>

            </div>
        `;

    }

}


// ==========================================
// APPLY ALL FILTERS
// ==========================================

function applyFilters() {

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();


    let filtered =
        contacts.filter(contact => {


            // CATEGORY FILTER

            const categoryMatches =
                selectedCategory === "All" ||
                contact.category === selectedCategory;


            if (!categoryMatches) {

                return false;

            }


            // SEARCH FILTER

            if (searchTerm === "") {

                return true;

            }


            const name =
                String(contact.name || "")
                    .toLowerCase();


            const category =
                String(contact.category || "")
                    .toLowerCase();


            const description =
                String(contact.description || "")
                    .toLowerCase();


            const phone =
                String(contact.phone || "")
                    .toLowerCase();


            return (

                name.includes(searchTerm) ||

                category.includes(searchTerm) ||

                description.includes(searchTerm) ||

                phone.includes(searchTerm)

            );

        });


    displayContacts(filtered);

}


// ==========================================
// DISPLAY CONTACTS
// ==========================================

function displayContacts(list) {

    contactsContainer.innerHTML = "";


    contactCount.textContent =
        `${list.length} service${list.length === 1 ? "" : "s"} available`;


    if (!list || list.length === 0) {

        contactsContainer.innerHTML = `

            <div class="empty-message">

                <h3>
                    No matching services
                </h3>

                <p>
                    Try another category or search term.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(contact => {

        const card =
            document.createElement("div");


        card.className =
            "contact-card";


        card.innerHTML = `

            <div class="contact-icon">
                ${contact.icon || getCategoryIcon(contact.category)}
            </div>


            <h3>
                ${escapeHTML(contact.name)}
            </h3>


            <div class="category">
                ${escapeHTML(contact.category || "General")}
            </div>


            <div class="phone">
                ${escapeHTML(String(contact.phone || ""))}
            </div>


            <p>
                ${escapeHTML(contact.description || "")}
            </p>


            <small>
                Availability:
                ${escapeHTML(
                    contact.availability ||
                    "Check official source"
                )}
            </small>


            ${
                contact.verified
                ?
                `
                    <div class="verified">
                        ✓ Source verified
                    </div>
                `
                :
                ""
            }


            <a
                class="call-button"
                href="tel:${cleanPhone(contact.phone)}"
            >
                📞 Call Now
            </a>

        `;


        contactsContainer.appendChild(card);

    });

}


// ==========================================
// CATEGORY ICON
// ==========================================

function getCategoryIcon(category) {

    const icons = {

        "Emergency": "🚨",

        "Police": "🚔",

        "Medical": "🚑",

        "Fire": "🔥",

        "Women": "👩",

        "Children": "👶",

        "Cyber Crime": "💻",

        "Government Services": "🏛️",

        "Railways": "🚆",

        "Consumer": "⚖️",

        "Disaster": "🌊",

        "Senior Citizens": "👴",

        "Disability Support": "♿"

    };


    return icons[category] || "📞";

}


// ==========================================
// CATEGORY BUTTON EVENTS
// ==========================================

categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {


            // Remove active state

            categoryButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            // Activate clicked button

            this.classList.add("active");


            // Save selected category

            selectedCategory =
                this.dataset.category;


            // Re-filter contacts

            applyFilters();

        }
    );

});


// ==========================================
// SEARCH EVENT
// ==========================================

searchInput.addEventListener(
    "input",
    function () {

        applyFilters();

    }
);


// ==========================================
// STATE SELECTION
// ==========================================

stateSelect.addEventListener(
    "change",
    async function () {

        const selectedState =
            stateSelect.value;


        // Reset category

        selectedCategory =
            "All";


        categoryButtons.forEach(button => {

            button.classList.remove("active");

        });


        categoryButtons[0]
            .classList.add("active");


        // Clear search

        searchInput.value = "";


        // National

        if (!selectedState) {

            await loadNationalContacts();

            return;

        }


        // State

        await loadStateContacts(
            selectedState
        );

    }
);


// ==========================================
// GET STATE NAME
// ==========================================

function getStateName(stateId) {

    const state =
        states.find(
            item =>
                item.id === stateId
        );


    return state
        ? state.name
        : "Selected State";

}


// ==========================================
// CLEAN PHONE NUMBER
// ==========================================

function cleanPhone(phone) {

    return String(phone || "")
        .replace(/[^0-9+]/g, "");

}


// ==========================================
// BASIC HTML ESCAPING
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// ERROR
// ==========================================

function showError() {

    contactCount.textContent =
        "Unable to load contacts";


    contactsContainer.innerHTML = `

        <div class="empty-message">

            <h3>
                Unable to load contacts
            </h3>

            <p>
                Please refresh the application
                and try again.
            </p>

        </div>

    `;

}


// ==========================================
// INITIALIZE
// ==========================================

async function initializeApp() {

    console.log(
        "🇮🇳 India Emergency Directory starting..."
    );


    await loadStates();

    await loadNationalContacts();


    console.log(
        "Application loaded successfully."
    );

}


// ==========================================
// START
// ==========================================

initializeApp();
