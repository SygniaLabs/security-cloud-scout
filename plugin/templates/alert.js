const { brotliDecompress } = require("zlib");

var alert = {};

var template = (message) => `
<div id="alertContainer" transitions="fade"
style="top: 0px; left: 50%; transform: translate(-50%, 0%); position: fixed; z-index: 100; width: 25%;">
    <div style="transition: opacity 250ms ease 0s; opacity: 1;">
    <div
        style="background-color: rgb(21, 21, 21); color: white; padding: 10px; text-transform: uppercase; border-radius: 3px; display: flex; justify-content: space-between; align-items: center; box-shadow: rgba(0, 0, 0, 0.03) 0px 2px 2px 2px; font-family: Arial; width: 300px; box-sizing: border-box; margin: 30px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="#2E9AFE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            style="margin-right: 20px; min-width: 24px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="8"></line>
        </svg><span style="flex: 2 1 0%;">${message}</span><button
            style="margin-left: 20px; border: none; background-color: transparent; cursor: pointer; color: rgb(255, 255, 255);"><svg
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                style="margin-right: 0px; min-width: 24px;">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg></button></div>
    </div>
</div>
`
function closeAlert() {
    $("#alertContainer").remove()
}

alert.alertBH = (message) => {
    let body = $("body")[0].children;
    let alertDiv = body[body.length - 1];
    alertDiv.innerHTML = template(message);
    $("#alertContainer button")[0].onclick = closeAlert;
}

alert.loading = (e) => {
    e.target.isloading = true;
    e.target.classList.remove('menu-button-light');
    var innerHTML = e.target.innerHTML;
    e.target.innerHTML = "0%";
    return innerHTML;
}
alert.updatePercentage = (e, percentage) => {
    e.target.innerHTML = percentage;
}

alert.endLoading = (e, innerHTML) => {
    e.target.isloading = false;
    e.target.classList.add('menu-button-light');
    e.target.innerHTML = innerHTML;
}

module.exports = alert;