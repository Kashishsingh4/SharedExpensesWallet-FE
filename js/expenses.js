// expenses.js
$(document).ready(function () {
    const username = localStorage.getItem("username");
    if (username) {
        $("#username-display").text(username);
        loadExpenses(username);
    } else {
        window.location.href = "index.html";
    }
});

function loadExpenses(username) {
    $.get("http://localhost:5000/expenses", { username: username }, function (response) {
        let expensesHtml = '';
        if (response.expenses.length === 0) {
            expensesHtml = '<p>No available expenses.</p>';
        } else {
            response.expenses.forEach(expense => {
                expensesHtml += `
                    <div class="expense-item">
                        <p><strong>Description:</strong> ${expense.description}</p>
                        <p><strong>Amount:</strong> $${expense.amount}</p>
                        <p><strong>Participants:</strong> ${expense.participants.map(p => `${p.username}: $${p.amountOwed}`).join(', ')}</p>
                        ${!expense.settled ? `<button class="settle-expense" data-id="${expense._id}">Settle Expense</button>` : '<p>Settled</p>'}
                    </div>
                `;
            });
        }
        $("#expenses-list").html(expensesHtml);

        $(".settle-expense").click(function () {
            const expenseId = $(this).data("id");
            settleExpense(expenseId);
        });
    }).fail(function (xhr, status, error) {
        console.error("Error loading expenses:", error);
        alert("Error loading expenses.");
    });
}

function settleExpense(expenseId) {
    $.ajax({
        url: `http://localhost:5000/expenses/settle/${expenseId}`,
        type: "PUT",
        success: function (response) {
            alert("Expense settled.");
            loadExpenses(localStorage.getItem("username"));
        },
        error: function (xhr, status, error) {
            alert("Error settling expense: " + error);
            console.error("Error settling expense:", error);
        }
    });
}

function goBack() {
    window.location.href = "dashboard.html";
}