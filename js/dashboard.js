$(document).ready(function () {
    const username = localStorage.getItem("username");
    if (username) {
        $("#username-display").text(username);
    } else {
        window.location.href = "index.html";
    }

    loadExpenses(username);
});

let participants = [];

function loadExpenses(username) {
    $.get("http://localhost:5000/expenses", { username: username }, function (response) {
        let sidebarHtml = '';

        response.expenses.forEach(expense => {
            if (!expense.settled) {
                sidebarHtml += `<li class="sidebar-item" data-id="${expense._id}">${expense.description}</li>`;
            }
        });

        $("#expense-sidebar-list").html(sidebarHtml);

        $(".sidebar-item").click(function () {
            const expenseId = $(this).data("id");
            viewExpenseDetails(expenseId);
        });
    }).fail(function (xhr, status, error) {
        console.error("Error loading expenses:", error);
        alert("Error loading expenses.");
    });
}

function viewExpenseDetails(expenseId) {
    $.get(`http://localhost:5000/expenses/${expenseId}`, function (response) {
        const expense = response.expense;
        $("#expense-detail-description").text(expense.description);
        $("#expense-detail-amount").text(`Amount: $${expense.amount}`);
        
        let participantsHtml = '<h4>Participants</h4>';
        expense.participants.forEach(participant => {
            participantsHtml += `<p>${participant.username}: $${participant.amountOwed}</p>`;
        });

        $("#expense-detail-participants").html(participantsHtml);
        $("#expense-details").show();
        $("#expense-details").data("expense-id", expenseId);
    }).fail(function (xhr, status, error) {
        console.error("Error fetching expense details:", error);
        alert("Error fetching expense details.");
    });
}

function settleExpense() {
    const expenseId = $("#expense-details").data("expense-id");

    $.ajax({
        url: `http://localhost:5000/expenses/settle/${expenseId}`,
        type: "PUT",
        success: function (response) {
            alert("Expense settled.");
            loadExpenses(localStorage.getItem("username"));
            $("#expense-details").hide();
        },
        error: function (xhr, status, error) {
            alert("Error settling expense: " + error);
            console.error("Error settling expense:", error);
        }
    });
}

function addParticipant() {
    const participantUsername = $("#participant-username").val().trim();
    const participantAmount = parseFloat($("#participant-amount").val().trim());

    if (!participantUsername || !participantAmount || participantAmount <= 0) {
        alert("Please provide a valid participant and amount.");
        return;
    }

    participants.push({
        username: participantUsername,
        amountOwed: participantAmount
    });


    updateParticipantList();
    $("#participant-username").val('');
    $("#participant-amount").val('');
}

function updateParticipantList() {
    let participantHtml = '';
    participants.forEach((participant, index) => {
        participantHtml += `<p>${participant.username}: $${participant.amountOwed}</p>`;
    });
    $("#participant-list").html(participantHtml);
}

function addExpense() {
    const username = localStorage.getItem("username");
    const amount = parseFloat($("#expense-amount").val().trim());
    const description = $("#expense-description").val().trim();

    if (!amount || !description) {
        alert("Please provide an amount and description.");
        return;
    }

    if (participants.length === 0) {
        alert("Please add at least one participant.");
        return;
    }

   
    const totalOwed = participants.reduce((sum, participant) => sum + participant.amountOwed, 0);

   
    if (totalOwed > amount) {
        alert("The total amount owed by participants cannot exceed the total expense amount.");
        return;
    }

    const expense = {
        amount: amount,
        description: description,
        username: username,
        participants: participants
    };

    $.ajax({
        url: "http://localhost:5000/expenses",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(expense),
        success: function (response) {
            loadExpenses(username);
            $("#expense-amount").val('');
            $("#expense-description").val('');
            participants = [];
            updateParticipantList();
        },
        error: function (xhr, status, error) {
            alert("Error adding expense: " + error);
            console.error("Error adding expense:", error);
        }
    });
}

function logout() {
    localStorage.removeItem("username");
    window.location.href = "index.html";
}
