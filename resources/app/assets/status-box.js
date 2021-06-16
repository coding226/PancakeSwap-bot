const statusCircle = document.getElementById("status-circle")

module.exports.setActiveStatus = function() {
    //if(localStorage["botRunning"] == false) {
        const content = `
            Scanning Tokens...
        `
        $('#status-circle-container').html(content);

        statusCircle.style.stroke = "green";
        statusCircle.style.fill = "green";
        statusCircle.style.boxShadow = "10px 10px 5px green";

        localStorage["botRunning"] = true;
    //}
}

module.exports.setInactiveStatus = function() {
    //if(localStorage["botRunning"] == true) {
        const content = `
            Not Running
        `
        $('#status-circle-container').html(content);

        statusCircle.style.stroke = "red";
        statusCircle.style.fill = "none";
        statusCircle.style.boxShadow = "10px 10px 5px red";

        localStorage["botRunning"] = false;
    //}
}