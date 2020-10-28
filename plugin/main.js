const fs = require('fs');
const helpers = require('./helpers.js');
const ingestion = require('./ingestors/ingestion.js');
var markup = require('./templates/syTemplate.js');
const alertHelper = require('./templates/alert.js');
const alert = require('./templates/alert.js');
const eachSeries = require('async').eachSeries
main();

async function main() {
	await setup_layout();
	add_constraints();

	// Graph click events
	sigmaInstance = sigma.instances()[0];
	sigmaInstance.bind("clickNode", nodeClick);
	// sigmaInstance.bind("clickEdge", edgeClick);

	var dataElements = addDBStats();
	refreshDBStats(dataElements);
	createInterval(dataElements);

	var vis = require('./visualisation.js');
}

function nodeClick(e) {
	var bloodHoundLabels = ["Group", "User", "OU", "GPO", "Domain", "Computer"];
	if (bloodHoundLabels.includes(e.data.node.type)) {
		$(".sya").remove()
		return;
	}

	$("li").filter(".active").removeClass("active");
	$("li")[1].classList.add("active");
	$("li a").attr("aria-selected", false);
	$("li a").removeAttr("tabindex");
	$("li a#tab-style-tab-2").attr("aria-selected", true)

	$("div.fade.tab-pane.active.in").removeClass("active in");
	$("#tab-style-pane-2").addClass("active in");
	$("#tab-style-pane-2 div")[0].classList.add('hidden');
	$("#tab-style-pane-2 div")[1].innerHTML = markup(e.data.node);
}

function edgeClick(e) {
	// This functionallity not yet supported
}

async function add_constraints() {
	let session = driver.session();
	await session
		.run('CREATE CONSTRAINT ON (c:Base) ASSERT c.objectid IS UNIQUE')
		.catch(_ => { });
	await session.run('CREATE INDEX ON :CloudVM(name)').catch(_ => { });
	await session.run('CREATE INDEX ON :CloudNIC(name)').catch(_ => { });
	await session.run('CREATE INDEX ON :CloudNSG(name)').catch(_ => { });
	await session.run('CREATE INDEX ON :CloudKeyVault(name)').catch(_ => { });
	await session.run('CREATE INDEX ON :CloudRG(name)').catch(_ => { });
	await session.run('CREATE INDEX ON :CloudSubscription(name)').catch(_ => { });
	await session.run('CREATE INDEX ON :CloudRole(name)').catch(_ => { });
	await session.run('CREATE INDEX ON :CloudApp(name)').catch(_ => { });
	await session.run('CREATE INDEX ON :CloudSP(name)').catch(_ => { });
	session.close();
}

function cloneButton(remove_class, add_class) {
	button = menuDiv.children[6].cloneNode(true);
	button.childNodes[0].childNodes[0].classList.remove(remove_class);
	button.childNodes[0].childNodes[0].classList.add(add_class);
	return button;
}

function setButtonFunctionallity(button, caption, onclick) {
	var buttonIcon = button.children[0].innerHTML;
	button.children[0].isloading = false;
	button.onmouseenter = function () {
		button.children[0].width = 0;
		button.children[0].style = "width: 140px; transition: opacity 1s ease-in;"
		if (!button.children[0].isloading) {
			button.children[0].innerHTML = caption + buttonIcon;
		}
		button.children[0].onmouseenter = null;
	}
	button.onmouseout = function () {
		button.children[0].style = "width: 41px; transition: opacity 1s ease-in;"
		if (!button.children[0].isloading) {
			button.children[0].innerHTML = buttonIcon;
		}
	}
	button.onclick = onclick;
}

function addDBRow(title, data) {
	var dbStats = $(".dl-horizontal.dl-horizontal-fix")[0];
	var row = {};
	row.title = dbStats.childNodes[0].cloneNode(true);
	row.data = dbStats.childNodes[1].cloneNode(true);
	row.title.innerText = title;
	row.data.innerText = data;
	dbStats.appendChild(row.title);
	dbStats.appendChild(row.data);
	return row;
}

function addDBStats() {
	var dataElements = {};
	// AWSPX
	dataElements.awspx = addDBRow("AWSPX", "0").data;
	// Azure Sygnia
	dataElements.azureSygnia = addDBRow("AzureSygnia", "0").data;
	// StromSpotter
	dataElements.stormSpotter = addDBRow("StormSpotter", "0").data;

	return dataElements;
}

function createInterval(dataElements) {
	setInterval(() => {
		refreshDBStats(dataElements);
	}, 6000);
}

function refreshDBStats(dataElements) {
	var s1 = driver.session();

	s1.run("MATCH (n) RETURN DISTINCT LABELS(n), COUNT(n)").then(
		result => {
			var awspx = 0;
			var storm = 0;
			var azure = 0;
			result.records.forEach(e => {
				// TODO: Decide which platform this label for
				var label = e._fields[0];
				if (label.includes("AWS::Iam::Role")) {
					awspx += e._fields[1];
				} else if (label.includes("AADUser")) {
					storm += e._fields[1];
				} else if (label.includes("CloudNSG")) {
					azure += e._fields[1];
				}
				dataElements.awspx.innerText = awspx;
				dataElements.stormSpotter.innerText = storm;
				dataElements.azureSygnia.innerText = azure;
			});
		}
	);
}

async function setup_layout() {
	console.log("Setup layout");

	menuDiv = document.getElementsByClassName("menudiv").item(0)
	while (menuDiv === null) {
		await helpers.sleep(1000).then(() => {
			menuDiv = document.getElementsByClassName("menudiv").item(0)
		});
	}


	// Create buttons
	importStormButton = cloneButton('fa-info', 'fa-cloud-upload-alt');
	menuDiv.appendChild(importStormButton);
	setButtonFunctionallity(importStormButton, "Import Storm ", importStorm);

	importAWSButton = cloneButton('fa-info', 'fa-cloud-upload-alt');
	menuDiv.appendChild(importAWSButton);
	setButtonFunctionallity(importAWSButton, "Import AWSPX ", importAWS);

	importAzureButton = cloneButton('fa-info', 'fa-cloud-upload-alt');
	menuDiv.appendChild(importAzureButton);
	setButtonFunctionallity(importAzureButton, "Import Azure ", importCloudAzure);

	computeAttacksAWSButton = cloneButton('fa-info', 'fa-search');
	menuDiv.appendChild(computeAttacksAWSButton);
	setButtonFunctionallity(computeAttacksAWSButton, "Compute Attacks ", computeAttacksAWS);

	createSygniaLinkButton = cloneButton('fa-info', 'fa-link');
	menuDiv.appendChild(createSygniaLinkButton);
	setButtonFunctionallity(createSygniaLinkButton, "Create Links ", createLinks);

}

async function createLinks(e) {
	let innerHTML = alertHelper.loading(e);
	s = driver.session()
	queries = [
		// BLOOD - [] -> STORM
		// Link StormSpotter users and groups to on prem users and groups
		"MATCH (user:User) WITH user MATCH (m:AADUser { onPremisesSecurityIdentifier: user.objectid }) MERGE (user)-[r:LINKED]->(m)",
		"MATCH (group:Group) WITH group MATCH (m:AADGroup { onPremisesSecurityIdentifier: group.objectid }) MERGE (group)-[r:LINKED]->(m)",
		// Link possible cloudVM to on-prem computer
		"MATCH (vm:VirtualMachine), (c:Computer) \
		WHERE toLower(split(vm.id,'/')[-1]) = toLower(split(c.name, '.')[0]) WITH vm,c \
		MERGE (vm)-[r:LINKED]->(c)",

		// AWS - [] -> STORM
		"MATCH (user:AADUser) WITH user\
		MATCH (n:`AWS::Iam::User`) WHERE toLower(split(n[':ID'], '/')[1]) = toLower(user.mail)\
		MERGE (user)-[r:LINKED]->(n)",

		"MATCH (arole:`AWS::Iam::Role`) WITH arole \
		MATCH (n:AADServicePrincipal) WHERE n.raw CONTAINS arole['Arn:string'] \
		MERGE (n)-[r:LINKED]->(arole)",

		"MATCH (arole:`AWS::Iam::Role`) with arole \
		MATCH (n:AADApplication) WHERE n.raw CONTAINS arole['Arn:string'] \
		MERGE (n)-[r:LINKED]->(arole)",
		// BLOOD - [] -> AWS
		"MATCH (user:User) WITH user\
		MATCH (n:`AWS::Iam::User`) WHERE n[':ID'] CONTAINS user.email\
		MERGE (user)-[r:LINKED]->(n)",

		// BLOOD - [] -> AZURE_SY
		// Link Sygnia Azure Users  
		"MATCH (user:User) WITH user MATCH (m:CloudUser {onPremId: user.objectid}) MERGE (user)-[r:LINKED]->(m)",
		"MATCH (group:Group) WITH group MATCH (m:CloudGroup {onPremId: group.objectid}) MERGE (group)-[r:LINKED]->(m)",
		// Link possible cloudVM to on-prem computer
		"MATCH (vm:CloudVM) WITH vm \
		MATCH (m:Computer) WHERE m.name CONTAINS vm.name \
		MERGE (vm)-[r:LINKED]->(m)",
		// TENANT - [] -> TENANT (CloudUser -> CloudUser)
		// Link Sygnia Azure users to same identities on over tenants
		"MATCH (user:CloudUser) WITH user MATCH (m:CloudUser {email: user.email}) WHERE not m = user MERGE (user)-[r:LINKED]->(m)",
		// AZURE_SY - [] - AWS
		// AWS connections by Role
		"MATCH (role:`AWS::Iam::Role`) WITH role \
		MATCH (n:CloudRole) WHERE n.value CONTAINS role['Arn:string'] \
		MERGE (n)-[r:LINKED]->(role)",

		// STORM - [] - STORM (SY)
		"MATCH (role:AADRole {name: 'Application Administrator'}) with role\
		MATCH (sp:AADServicePrincipal)\
		MERGE (role)-[:CreateCreds]->(sp)",

		"MATCH (role:AADRole {name: 'Groups Administrator'}) with role\
		MATCH (group:AADGroup)\
		MERGE (role)-[:EDIT]->(group)",
	]

	for (i = 0; i < queries.length; i++) {
		await s.run(queries[i]);
		var perc = ~~((i / queries.length) * 100);
		alert.updatePercentage(e, `${perc}%`)
	}
	alertHelper.endLoading(e, innerHTML);
	alertHelper.alertBH("Finised processing connections");
}

async function importStorm(element) {
	let innerHTML = alertHelper.loading(element);
	console.log("import Stormspotter")
	// Get file pathname
	var input = $(document.createElement("input"));
	input.change(function (e) {
		if (e.target.files.length > 1) {
			alert("Error: Only one file allowed");
			return;
		}
		var filePath = e.target.files[0].path;
		var fileName = e.target.files[0].name;
		console.log('The file "' + fileName + '" has been selected.');
		var bhDir = process.cwd();
		var stormImport = bhDir + '\\helpers\\StormSpotter\\Stormspotter_Import.bat ';
		var creds = " " + driver._authToken.principal + " " + driver._authToken.credentials;
		console.log(stormImport + filePath + creds);
		var creds = [filePath, fileName, driver._authToken.principal, driver._authToken.credentials];
		helpers.sh_new(stormImport, creds,
			(data) => {

				console.log(data.toString());
			},
			(data) => {
				console.log(data.toString());
			},
			(code) => {
				console.log(`child process exited with code ${code}`);
				switch (code) {
					case 0:
						alertHelper.alertBH("Finised importing StormSpotter");
						break;
					default:
						alertHelper.alertBH("Error importing StormSpotter");
						break;
				}
				alertHelper.endLoading(element, innerHTML);
			});
	});
	input.attr("type", "file");
	input.trigger("click");
}

function importAWS(element) {
	console.log("Import AWS");
	let innerHTML = alertHelper.loading(element);
	var input = $(document.createElement("input"));
	input.change(function (e) {
		if (e.target.files.length > 1) {
			alert("Error: Only one file allowed");
			return;
		}
		var filePath = e.target.files[0].path;
		var fileName = e.target.files[0].name;
		console.log('The file "' + fileName + '" has been selected.');
		alertHelper.alertBH(`Start processing file: ${fileName}`);
		if (fileName.split('.').slice(-1)[0] === 'json') {
			ingestion.getFileMeta(filePath);
			return;
		}
		// Add sh, to convert awspx
		console.log("Start SH");
		var bhDir = process.cwd();
		var awsImport = bhDir + '\\helpers\\AWS\\convert.bat ';
		var se = helpers.sh(awsImport + filePath);
		helpers.sh_new(awsImport, [filePath],
			(data) => {
				console.log(data.toString());
			},
			(data) => {
				console.log(data.toString());
			},
			(code) => {
				alert.updatePercentage(element, `50%`)
				console.log("SH End");

				var dirPath = bhDir + '\\helpers\\AWS\\temp\\';
				var files = fs.readdirSync(dirPath);

				eachSeries(
					files,
					(file, callback) => {
						var filePath = dirPath + file;
						ingestion.getFileMeta(filePath, callback);
					},
					() => {
						alertHelper.alertBH("AWSPX Ingest completed");
						alertHelper.endLoading(element, innerHTML);
					});
			});

	});
	input.attr("type", "file");
	input.trigger("click");
}

function computeAttacksAWS(e) {
	let innerHTML = alertHelper.loading(e);
	console.log("Compute AWSPX attacks")
	var bhDir = process.cwd();
	var computeAttacks = bhDir + '\\helpers\\AWS\\attacks\\attacks.bat ';
	var creds = [driver._authToken.principal, driver._authToken.credentials];
	helpers.sh_new(computeAttacks, creds,
		(data) => {
			console.log(data.toString());
		},
		(data) => {
			console.log(data.toString());
		},
		(code) => {
			console.log("Attacks search completed");
			alertHelper.endLoading(e, innerHTML);
		}
	)
}

function importCloudAzure(element) {
	let innerHTML = alertHelper.loading(element);
	var input = $(document.createElement("input"));
	input.change(function (e) {
		eachSeries(
			e.target.files,
			(file, callback) => {
				ingestion.getFileMeta(file.path, callback);
			},
			() => {
				console.log("end ingest");
				alertHelper.alertBH("Ingest completed");
				alertHelper.endLoading(element, innerHTML);
			});
	});
	input.attr("type", "file");
	input.attr("multiple", "");
	input.trigger("click");
}
