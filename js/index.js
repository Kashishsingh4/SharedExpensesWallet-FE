function enterSite() {
    let username = document.getElementById("username").value.trim();

    if (username === "") {
        alert("Please enter a username.");
        return;
    }
    $.ajax({
        url: "http://localhost:5000/user",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ username: username }),
        success: function(response) {
            localStorage.setItem("username", username);
            window.location.href = "dashboard.html";
        },
        error: function() {
            alert("Error saving username.");
        }
    });
}
