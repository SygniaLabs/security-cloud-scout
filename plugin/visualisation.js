const { prependListener } = require("process");

//Get web page
function httpGet(theUrl) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false); // false for synchronous request
	xmlHttp.send(null);
	return xmlHttp.responseText;
}
//import awspx icons
console.log("Importing awspx icons...")
var w = httpGet('https://raw.githubusercontent.com/FSecureLABS/awspx/master/www/src/icons.js');
w = w.replace("export default", "var awspxR  =");
//import strom
eval(w);
console.log("Importing stormspoter icons...")
var s = httpGet('https://raw.githubusercontent.com/Azure/Stormspotter/main/frontend/src/cy-config.js');
var conStart = s.indexOf("NODE_LABELS")
var conEnd = s.indexOf("}", conStart);
var ss = s.substring(conStart, conEnd + 1);
ss = ss.replace("NODE_LABELS", "stormSpoterR");
var sb = ss.split("images[\"").join("{url:'https://raw.githubusercontent.com/Azure/Stormspotter/main/frontend/src/assets/nodes/").split("\"]").join("'}")
eval(sb);


//Creating obsever on the bloodhound animation contin the status, example:
// Querying Database
// Processing Data
// Initial Layout
// Done!
// The "Done!" event after "Initial Layout" is the trigger that the ui is ready.
var d = document.getElementsByClassName("loadingIndicator loading-indicator-light")[0].children[0]
var process = true;
$('body').on('DOMSubtreeModified', d, function () {
	if (d.innerText == "Querying Database") {
		process = true;
	}
	if (d.innerText == "Done!" && process) {
		sigint = sigma.instances(0);
		sigint.graph.nodes().forEach(
			(e) => { changeImage(e) }
		)
		process = false;
	}
});

function changeImage(e) {
	var azureCloudTypes = {
		'CloudUser': 'AADUser',
		"CloudGroup": 'AADGroup',
		"CloudNIC": 'NetworkInterface',
		"CloudVM": 'VirtualMachine',
		"CloudHD": 'Disk',
		"CloudKeyVault": 'KeyVault',
		"CloudSP": 'AADServicePrincipal',
		"CloudNSG": 'NetworkSecurityGroup',
		"CloudSubscription": 'Subscription',
		"CloudRG": 'ResourceGroup',
		"CloudApp": 'AADApplication',
		"CloudRole": 'AADServicePrincipal',
	};
	var v = ss.split("{")[1].split(",");
	var stormSpotter = [];
	v.forEach(element => stormSpotter.push(element.split(":")[0].trim()));

	// StormSpotter
	if(e.type === "IP") {
		e.icon = {font: "'Font Awesome 5 Free'", content: "\uF0C2", scale: 1, color: "#7F72FD"};
	}
	else if (["User", "GPO", "Group", "OU", "Domain", "Computer"].includes(e.type)) {
		return;
	}
	else if (stormSpotter.includes(e.type) || e.type === "AADObject" || e.type === "AzureResource") {
		if (e.props.type === undefined) {
			e.image = stormSpoterR[e.type];
		} else {
			e.image = stormSpoterR[e.props.type];
		}
	}
	else if (Object.keys(azureCloudTypes).includes(e.type)) {
		e.image = stormSpoterR[azureCloudTypes[e.type]];
	}
	else {
		switch (e.type) {
			case "Resource":
				e.image = {};
				e.image.url = awsIconFix(e.props[':LABEL'].replace(";Resource", ""));
				break;
			default:
				e.image = {};
				if (e.props[':LABEL'] === undefined) {
					e.image.url = awsIconFix(e.type);
				} else { e.image.url = awsIconFix(e.props[':LABEL']); }
				break;
		}
	}
}

function awsIconFix(label) {
	spl = label.split("::")
	if (spl.length == 1) {
		return awspxR[spl[0]];
	} else if (spl.length == 2) {
		return awspxR[spl[0]][spl[1]];
	} else if (spl.length == 3) {
		return awspxR[spl[0]][spl[1]][spl[2]];
	}
}