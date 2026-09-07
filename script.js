// ==========================================
// INDIA EMERGENCY DIRECTORY
// Main Application JavaScript
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const stateSelect = document.getElementById("stateSelect");
const contactsContainer = document.getElementById("contactsContainer");
const searchInput = document.getElementById("searchInput");


// ==========================================
// APPLICATION DATA
// ==========================================

let contacts = [];
let states = [];


// ==========================================
// LOAD STATES / UNION TERRITORIES
// ==========================================

async function loadStates() {

    try {

        const response = await fetch("data/states.json");

        if (!response.ok) {
            throw new Error("Unable to load states.json");
        }

        states = await response.json();

        // Clear existing options except first option
        stateSelect.innerHTML = `
            <option value="">
                Select State / Union Territory
            </option>
        `;


        // Add states to dropdown
        states.forEach(state => {

            const option = document.createElement("option");

            option.value = state.id;

            option.textContent =
                `${state.name} — ${state.type}`;

            stateSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Error loading states:",
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

async function loadContacts() {

    try {

        const response =
            await fetch("data/national.json");


        if (!response.ok) {

            throw new Error(
                "Unable to load national.json"
            );

        }


        contacts = await response.json();


        // Display contacts
        displayContacts(contacts);


    } catch (error) {

        console.error(
            "Error loading contacts:",
            error
        );


        contactsContainer.innerHTML = `

            <div class="empty-message">

                <h3>
                    Unable to load contacts
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}


// ==========================================
// DISPLAY CONTACTS
// ==========================================

function displayContacts(list) {

    contactsContainer.innerHTML = "";


    // No contacts found
    if (!list || list.length === 0) {

        contactsContainer.innerHTML = `

            <div class="empty-message">

                <h3>
                    No contacts found
                </h3>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    // Create cards
    list.forEach(contact => {

        const card =
            document.createElement("div");


        card.className =
            "contact-card";


        card.innerHTML = `

            <div class="contact-icon">
                ${contact.icon || "📞"}
            </div>


            <h3>
                ${contact.name}
            </h3>


            <div class="category">
                ${contact.category || "General"}
            </div>


            <div class="phone">
                ${contact.phone}
            </div>


            <p>
                ${contact.description || ""}
            </p>


            ${
                contact.availability
                ?
                `
                <small>
                    Availability:
                    ${contact.availability}
                </small>
                `
                :
                ""
            }


            ${
                contact.verified
                ?
                `
                <div class="verified">
                    ✓ Officially verified
                </div>
                `
                :
                ""
            }


            <a
                class="call-button"
                href="tel:${contact.phone}"
            >
                📞 Call Now
            </a>

        `;


        contactsContainer.appendChild(card);

    });

}


// ==========================================
// SEARCH CONTACTS
// ==========================================

searchInput.addEventListener(
    "input",
    function () {

        const searchTerm =
            searchInput.value
                .toLowerCase()
                .trim();


        // If search is empty
        if (searchTerm === "") {

            displayContacts(contacts);

            return;

        }


        // Search name, category,
        // description and phone number

        const filteredContacts =
            contacts.filter(contact => {

                const name =
                    contact.name
                        ?.toLowerCase() || "";


                const category =
                    contact.category
                        ?.toLowerCase() || "";


                const description =
                    contact.description
                        ?.toLowerCase() || "";


                const phone =
                    contact.phone
                        ?.toString() || "";


                return (

                    name.includes(searchTerm)

                    ||

                    category.includes(searchTerm)

                    ||

                    description.includes(searchTerm)

                    ||

                    phone.includes(searchTerm)

                );

            });


        displayContacts(filteredContacts);

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


        // If no state selected
        // show national contacts

        if (!selectedState) {

            await loadContacts();

            return;

        }


        console.log(
            "Selected state:",
            selectedState
        );


        /*
            STATE DATABASE WILL BE CONNECTED
            IN THE NEXT STEP.

            Example:

            states/
            ├── uttar-pradesh.json
            ├── maharashtra.json
            ├── bihar.json
            └── ...
        */


        contactsContainer.innerHTML = `

            <div class="empty-message">

                <h3>
                    📍 ${getStateName(selectedState)}
                </h3>

                <p>
                    State-specific contacts
                    will be loaded here.
                </p>

            </div>

        `;

    }
);


// ==========================================
// GET STATE NAME
// ==========================================

function getStateName(stateId) {

    const state =
        states.find(
            item => item.id === stateId
        );


    if (state) {

        return state.name;

    }


    return "Selected State";

}


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

async function initializeApp() {

    console.log(
        "🇮🇳 India Emergency Directory starting..."
    );


    // Load states
    await loadStates();


    // Load national contacts
    await loadContacts();


    console.log(
        "Application loaded successfully."
    );

}


// ==========================================
// START APPLICATION
// ==========================================

initializeApp();
