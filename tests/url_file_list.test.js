const util = require("util");
const exec = util.promisify(require("child_process").exec);

test("check that all urls in a file list are crawled when the filelisturl param is passed", async () => {
  jest.setTimeout(30000);
  let passed = "";

  try{
    const data = await exec("docker-compose run crawler crawl --url http://www.example.com/ --collection filelisttest --urlFileList fixtures/urlSeedFile.txt");
  }
  catch (error) {
    passed = false;
  }
  datapackage = JSON.parse(fs.readFileSync("crawls/collections/filelisttest/datapackage.json", "utf8")
  seed_file = fs.readFileSync("tests/fixtures/urlSeedFile", "utf8").split("\n").sort()
  crawled_pages = []
  for (var i = 0; i < datapackage['resources'].length; i++) {
    crawled_pages.push(datapackage['resources'][i]['url'])
  }
  expect(crawled_pages.sort()).toBe(seed_file);
});


