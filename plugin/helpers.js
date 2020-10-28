var exec = require('child_process').exec, child;
const {spawn} = require('child_process')

var helper = {}

helper.sh = async function(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

helper.sh_new = (program, params, stdout, stderr, close) => {
  var process = spawn(program, params);

  process.stdout.on('data', (data)=>{
    stdout(data);
  });
  process.stderr.on('data', (data)=>{
    stderr(data);
  });
  process.on('close', (code)=>{
    close(code);
  })
}

// sleep time expects milliseconds
helper.sleep = function (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = helper;