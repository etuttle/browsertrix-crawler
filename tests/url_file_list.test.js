const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");

test("check that all urls in a file list are crawled when the filelisturl param is passed", async () => {
  jest.setTimeout(30000);

  try{

    await exec("docker-compose run crawler crawl --url http://www.example.com/ --collection filelisttest --urlFileList fixtures/urlSeedFile.txt");
    
  }
  catch (error) {
    console.log(error);
  }

  let crawled_pages = fs.readFileSync("crawls/collections/filelisttest/pages/pages.jsonl", "utf8").split("\n").sort()
  let seed_file = fs.readFileSync("tests/fixtures/urlSeedFile.txt", "utf8").split("\n").sort();

  expect(crawled_pages.sort()).toBe(seed_file);
});


