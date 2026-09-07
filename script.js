const stateSelect = document.getElementById("stateSelect");
const contactsContainer = document.getElementById("contactsContainer");
const searchInput = document.getElementById("searchInput");

let contacts = [];


// Load national emergency contacts

async function loadContacts() {

    try {

        const response = await fetch("data/national.json");

        contacts = await response.json();

        displayContacts(contacts);

    } catch (error) {

        contactsContainer.innerHTML = `
            <div class="empty-message">
                Unable to load emergency contacts.
            </div>
        `;

        console.error(error);
    }
}


// Display contact cards

function displayContacts(list) {

    contactsContainer.innerHTML = "";

    if (list.length === 0) {

        contactsContainer.innerHTML = `
            <div class="empty-message">
                No contacts found.
            </div>
        `;

        return;
    }


    list.forEach(contact => {

        const card = document.createElement("div");

        card.className = "contact-card";

        card.innerHTML = `

            <div class="contact-icon">
                ${contact.icon}
            </div>

            <h3>
                ${contact.name}
            </h3>

            <div class="category">
                ${contact.category}
            </div>

            <div class="phone">
                ${contact.phone}
            </div>

            <p>
                ${contact.description}
            </p>

            <br>

            <small>
                Availability: ${contact.available}
            </small>

            <br><br>

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


// Search

searchInput.addEventListener("input", () => {

    const searchTerm =
        searchInput.value.toLowerCase();

    const filteredContacts =
        contacts.filter(contact =>

            contact.name
                .toLowerCase()
                .includes(searchTerm)

            ||

            contact.category
                .toLowerCase()
                .includes(searchTerm)

        );

    displayContacts(filteredContacts);

});


// Start application

loadContacts();
