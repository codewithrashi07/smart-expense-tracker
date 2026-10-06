// ===============================
// SMART EXPENSE TRACKER
// ===============================


let transactions =
    JSON.parse(
        localStorage.getItem("transactions")
    ) || [];


let transactionType = "expense";

const budgetLimit = 50000;


// ===============================
// ELEMENTS
// ===============================

const form =
    document.getElementById(
        "transactionForm"
    );

const transactionList =
    document.getElementById(
        "transactionList"
    );

const balanceElement =
    document.getElementById(
        "balance"
    );

const incomeElement =
    document.getElementById(
        "income"
    );

const expenseElement =
    document.getElementById(
        "expense"
    );

const savingsElement =
    document.getElementById(
        "savings"
    );

const budgetSpent =
    document.getElementById(
        "budgetSpent"
    );

const budgetProgress =
    document.getElementById(
        "budgetProgress"
    );

const budgetPercentage =
    document.getElementById(
        "budgetPercentage"
    );


// ===============================
// DATE
// ===============================

document.getElementById("date").value =
    new Date()
        .toISOString()
        .split("T")[0];


// ===============================
// EXPENSE / INCOME BUTTON
// ===============================

document
    .querySelectorAll(".type-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".type-btn"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                transactionType =
                    button.dataset.type;

            }
        );

    });


// ===============================
// ADD TRANSACTION
// ===============================

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const title =
            document
                .getElementById("title")
                .value
                .trim();


        const amount =
            Number(
                document
                    .getElementById("amount")
                    .value
            );


        const category =
            document
                .getElementById("category")
                .value;


        const date =
            document
                .getElementById("date")
                .value;


        if (
            title === "" ||
            amount <= 0 ||
            date === ""
        ) {

            alert(
                "Please enter valid details."
            );

            return;

        }


        const transaction = {

            id:
                Date.now(),

            title:

                title,

            amount:

                amount,

            category:

                category,

            date:

                date,

            type:

                transactionType

        };


        transactions.unshift(
            transaction
        );


        saveTransactions();

        renderTransactions();

        updateDashboard();


        form.reset();


        document.getElementById(
            "date"
        ).value =
            new Date()
                .toISOString()
                .split("T")[0];

    }
);


// ===============================
// SAVE
// ===============================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(
            transactions
        )
    );

}


// ===============================
// CALCULATE
// ===============================

function calculateTotals() {

    let income = 0;

    let expense = 0;


    transactions.forEach(
        transaction => {

            if (
                transaction.type ===
                "income"
            ) {

                income +=
                    transaction.amount;

            } else {

                expense +=
                    transaction.amount;

            }

        }
    );


    return {

        income,

        expense,

        balance:
            income - expense

    };

}


// ===============================
// UPDATE DASHBOARD
// ===============================

function updateDashboard() {

    const totals =
        calculateTotals();


    incomeElement.textContent =
        formatCurrency(
            totals.income
        );


    expenseElement.textContent =
        formatCurrency(
            totals.expense
        );


    balanceElement.textContent =
        formatCurrency(
            totals.balance
        );


    savingsElement.textContent =
        formatCurrency(
            totals.balance
        );


    // Budget

    const percentage =
        Math.min(
            (
                totals.expense /
                budgetLimit
            ) * 100,

            100
        );


    budgetSpent.textContent =
        formatCurrency(
            totals.expense
        );


    budgetProgress.style.width =
        percentage + "%";


    budgetPercentage.textContent =
        Math.round(
            percentage
        ) + "%";

}


// ===============================
// RENDER TRANSACTIONS
// ===============================

function renderTransactions(
    data = transactions
) {

    transactionList.innerHTML = "";


    if (
        data.length === 0
    ) {

        transactionList.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#888;
                    "
                >

                    No transactions yet.

                </td>

            </tr>

        `;

        return;

    }


    data.forEach(
        transaction => {

            const row =
                document.createElement(
                    "tr"
                );


            const sign =
                transaction.type ===
                "income"
                    ? "+"
                    : "-";


            const amountClass =
                transaction.type ===
                "income"
                    ? "amount-income"
                    : "amount-expense";


            const icon =
                getIcon(
                    transaction.category
                );


            row.innerHTML = `

                <td>

                    <div
                        class="transaction-name"
                    >

                        <div
                            class="transaction-icon"
                        >

                            ${icon}

                        </div>

                        <strong>

                            ${escapeHTML(
                                transaction.title
                            )}

                        </strong>

                    </div>

                </td>


                <td>

                    ${transaction.category}

                </td>


                <td>

                    ${formatDate(
                        transaction.date
                    )}

                </td>


                <td
                    class="${amountClass}"
                >

                    ${sign}

                    ${formatCurrency(
                        transaction.amount
                    )}

                </td>


                <td>

                    <button
                        class="delete-btn"
                        onclick="
                            deleteTransaction(
                                ${transaction.id}
                            )
                        "
                    >

                        Delete

                    </button>

                </td>

            `;


            transactionList.appendChild(
                row
            );

        }
    );

}


// ===============================
// DELETE
// ===============================

function deleteTransaction(id) {

    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions();

    renderTransactions();

    updateDashboard();

}


// ===============================
// SEARCH
// ===============================

document
    .getElementById("search")
    .addEventListener(
        "input",
        filterTransactions
    );


document
    .getElementById("filter")
    .addEventListener(
        "change",
        filterTransactions
    );


function filterTransactions() {

    const search =
        document
            .getElementById("search")
            .value
            .toLowerCase();


    const filter =
        document
            .getElementById("filter")
            .value;


    const result =
        transactions.filter(
            transaction => {

                const searchMatch =
                    transaction.title
                        .toLowerCase()
                        .includes(search);


                const filterMatch =
                    filter === "all" ||
                    transaction.type ===
                        filter;


                return (
                    searchMatch &&
                    filterMatch
                );

            }
        );


    renderTransactions(
        result
    );

}


// ===============================
// CATEGORY ICON
// ===============================

function getIcon(category) {

    const icons = {

        Food: "🍔",

        Shopping: "🛍️",

        Transport: "🚕",

        Bills: "📄",

        Entertainment: "🎮",

        Health: "❤️",

        Education: "📚",

        Salary: "💰",

        Other: "📌"

    };


    return (
        icons[category] ||
        "📌"
    );

}


// ===============================
// CURRENCY
// ===============================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(amount);

}


// ===============================
// DATE
// ===============================

function formatDate(date) {

    return new Date(
        date
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ===============================
// SECURITY
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = text;

    return div.innerHTML;

}


// ===============================
// DARK MODE
// ===============================

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

    }
);


// ===============================
// INITIAL LOAD
// ===============================

renderTransactions();

updateDashboard();// ======================================
// DARK MODE
// ======================================

document.addEventListener("DOMContentLoaded", function () {

    const darkModeToggle = document.getElementById("darkModeToggle");

    if (!darkModeToggle) {
        console.log("Dark mode button not found");
        return;
    }

    // Check saved mode
    const savedMode = localStorage.getItem("darkMode");

    if (savedMode === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.innerHTML = "☀️ Light Mode";
    }

    // Toggle dark mode
    darkModeToggle.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem("darkMode", "enabled");

            darkModeToggle.innerHTML = "☀️ Light Mode";

        } else {

            localStorage.setItem("darkMode", "disabled");

            darkModeToggle.innerHTML = "🌙 Dark Mode";
        }
    });

});