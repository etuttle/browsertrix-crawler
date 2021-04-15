const fs = require("fs");


let crawled_pages_list = [];
let crawled_pages = fs.readFileSync("crawls/collections/wr-net/pages/pages.jsonl", "utf8").split("\n").sort();
let seed_file = fs.readFileSync("tests/fixtures/urlSeedFile.txt", "utf8").split("\n").sort();

let seed_file_list = [];
console.log(seed_file);
for (var j = 0; j < seed_file.length; j++) {
  console.log(seed_file[j]);
  if (seed_file[j] != undefined){
    seed_file_list.push(seed_file[j]);
  }
}

for (var i = 1; i < crawled_pages.length; i++) {
  if (crawled_pages[j] != undefined){
    crawled_pages_list.push(JSON.parse(crawled_pages[i])["url"]);
  }
}
console.log(crawled_pages_list);
console.log(seed_file_list);

expect(crawled_pages_list.sort()).toBe(seed_file_list);
