// ==========================================
// INDIA EMERGENCY DIRECTORY
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


// ==========================================
// APPLICATION DATA
// ==========================================

let contacts = [];

let states = [];


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


        states = await response.json();


        stateSelect.innerHTML = `
            <option value="">
                Select State / Union Territory
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

        const response =
            await fetch("data/national.json");


        if (!response.ok) {

            throw new Error(
                "Unable to load national contacts"
            );

        }


        contacts =
            await response.json();


        displayContacts(contacts);


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

                <h3>
                    Loading contacts...
                </h3>

                <p>
                    Please wait.
                </p>

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


        displayContacts(contacts);


    } catch (error) {

        console.error(
            "State contacts error:",
            error
        );


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
// DISPLAY CONTACTS
// ==========================================

function displayContacts(list) {

    contactsContainer.innerHTML = "";


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


            <small>
                Availability:
                ${contact.availability || "Check official source"}
            </small>


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
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    function () {

        const searchTerm =
            searchInput.value
                .toLowerCase()
                .trim();


        if (searchTerm === "") {

            displayContacts(contacts);

            return;

        }


        const filteredContacts =
            contacts.filter(contact => {

                const name =
                    (contact.name || "")
                    .toLowerCase();


                const category =
                    (contact.category || "")
                    .toLowerCase();


                const description =
                    (contact.description || "")
                    .toLowerCase();


                const phone =
                    String(
                        contact.phone || ""
                    );


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


        displayContacts(
            filteredContacts
        );

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


        // Nothing selected
        if (!selectedState) {

            await loadNationalContacts();

            return;

        }


        // Load selected state
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
// ERROR MESSAGE
// ==========================================

function showError() {

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
// START APPLICATION
// ==========================================

async function initializeApp() {

    console.log(
        "🇮🇳 Starting India Emergency Directory..."
    );


    await loadStates();

    await loadNationalContacts();


    console.log(
        "Application loaded successfully."
    );

}


// Start

initializeApp();
