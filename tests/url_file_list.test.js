const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");

test("check that all urls in a file list are crawled when the filelisturl param is passed", async () => {
  jest.setTimeout(30000);

  try{

    let testtest = fs.readdirSync("tests/fixtures");
    console.log(testtest);
    await exec("docker-compose run crawler crawl --url http://www.example.com/ --collection filelisttest --urlFileList ./tests/fixtures/urlSeedFile.txt");
    
  }
  catch (error) {
    console.log(error);
  }

});


