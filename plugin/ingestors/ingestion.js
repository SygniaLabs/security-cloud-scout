var fs = require('fs');
var streamChain = require('stream-chain')
var withParser = require('stream-json/filters/Pick').withParser
var streamArray = require('stream-json/streamers/StreamArray').streamArray
var aws = require('./AWS/awspx.js');

var ingestor = {};

ingestor.getFileMeta = function(file, callback) {
	let acceptableTypes = [
        ...aws.acceptableTypes,
        ...azure.acceptableTypes
	];
	let count;

	let size = fs.statSync(file).size;
	let start = size - 200;
	if (start <= 0) {
		start = 0;
	}
	fs.createReadStream(file, {
		encoding: 'utf8',
		start: start,
		end: size,
	}).on('data', (chunk) => {
		let type, version;
		try {
			type = /type.?:\s?"(\w*)"/g.exec(chunk)[1];
			count = /count.?:\s?(\d*)/g.exec(chunk)[1];
		} catch (e) {
			type = null;
		}
		try {
			version = /version.?:\s?(\d*)/g.exec(chunk)[1];
		} catch (e) {
			version = null;
		}

		if (version == null) {
			return;
		}

		if (!acceptableTypes.includes(type)) {
			return;
		}

		processJson(file, callback, parseInt(count), type, version);
	});
}


function processJson(file, callback, count, type, version = null) {
	let pipeline = streamChain.chain([
		fs.createReadStream(file, { encoding: 'utf8' }),
		withParser({ filter: type }),
		streamArray(),
	]);

	let localcount = 0;
	let sent = 0;
	let chunk = [];

	console.log(`Processing ${file}`);
	console.time('IngestTime');
	pipeline
		.on(
			'data',
			async function (data) {
				chunk.push(data.value);
				localcount++;

				if (localcount % 1000 === 0) {
					pipeline.pause();
					await uploadData(chunk, type, version);
					sent += chunk.length;
					chunk = [];
					pipeline.resume();
				}
			}.bind(this)
		)
		.on(
			'end',
			async function () {
				await uploadData(chunk, type, version);
				
				emitter.emit('refreshDBData');
				console.timeEnd('IngestTime');
				callback();
			}.bind(this)
		);
}
    
async function uploadData(chunk, type, version) {
	let session = driver.session();
	let funcMap;
	if (version == null) {
		funcMap = {
            ...aws.awsFuncMap,
            ...azure.azureFuncMap
		};
	} else {
		funcMap = {
			...aws.awsFuncMap,
            ...azure.azureFuncMap
		};
	}

	let data = funcMap[type](chunk);
	for (let key in data) {
		if (data[key].props.length === 0) {
			continue;
		}
		let arr = data[key].props.chunk();
		let statement = data[key].statement;
		for (let i = 0; i < arr.length; i++) {
			await session
				.run(statement, { props: arr[i] })
				.catch(function (error) {
					console.log(statement);
					console.log(data[key].props);
					console.log(error);
				});
		}
	}

	session.close();
}

module.exports = ingestor;