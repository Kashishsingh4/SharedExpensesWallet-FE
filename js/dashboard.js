// dashboard.js
$(document).ready(function () {
    const username = localStorage.getItem("username");
    if (username) {
        $("#username-display").text(username);
    } else {
        window.location.href = "index.html";
    }
});

let participants = [];

function viewExpenses() {
    window.location.href = "expenses.html"; 
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