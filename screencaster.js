const ws = require("ws");
const http = require("http");
const url = require("url");
const fs = require("fs");

const indexHTML = fs.readFileSync("/app/screencast/index.html", {encoding: "utf8"});

class ScreenCaster
{
  constructor(cluster) {
    this.cluster = cluster;

    this.httpServer = http.createServer((req, res) => {
      const pathname = url.parse(req.url).pathname;
      if (pathname === "/") {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(indexHTML);
      } else {
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("Not Found");
      }
    });

    this.allWS = new Set();

    this.targets = new Map();
    this.caches = new Map();
    this.urls = new Map();

    this.wss = new ws.Server({ noServer: true });

    this.wss.on('connection', (ws) => this.initWS(ws));

    this.httpServer.on('upgrade', (request, socket, head) => {
      const pathname = url.parse(request.url).pathname;

      if (pathname === '/ws') {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      }
    });

    this.httpServer.listen(9037);
  }

  initWS(ws) {
    for (const id of this.targets.keys()) {
      const data = this.caches.get(id);
      const url = this.urls.get(id);
      const msg = {"msg": "newTarget", id, url, data};
      ws.send(JSON.stringify(msg));
    }

    this.allWS.add(ws);

    if (this.allWS.size === 1) {
      this.startCastAll();
    }

    ws.on("close", () => {
      console.log("ws closed");
      this.allWS.delete(ws);

      if (this.allWS.size === 0) {
        this.stopCastAll();
      }
    });
  }

  sendAll(msg) {
    msg = JSON.stringify(msg);
    for (const ws of this.allWS) {
      ws.send(msg);
    }
  }

  async newTarget(target) {
    const cdp = await target.createCDPSession();
    const id = target._targetId;
    const url = target.url();

    this.targets.set(id, cdp);
    this.urls.set(id, url);

    this.sendAll({"msg": "newTarget", id, url});

    cdp.on("Page.screencastFrame", async (resp) => {
      console.log("cdp", cdp._sessionId, resp.sessionId);
      const data = resp.data;
      const sessionId = resp.sessionId;

      this.sendAll({"msg": "screencast", id, data});
      this.caches.set(id, data);
      await cdp.send("Page.screencastFrameAck", {sessionId});
    });

    if (this.allWS.size) {
      await this.startCast(cdp);
    }
  }

  async endTarget(target) {
    const id = target._targetId;
    const cdp = this.targets.get(id);
    if (!cdp) {
      return;
    }

    await this.stopCast(cdp);

    this.sendAll({"msg": "endTarget", id});

    this.targets.delete(id);
    this.caches.delete(id);
    this.urls.delete(id);

    await cdp.detach();
  }

  async startCast(cdp) {
    if (cdp._startedCast) {
      return;
    }

    cdp._startedCast = true;

    await cdp.send("Page.startScreencast", {format: "png", everyNthFrame: 1, maxWidth: 1024, maxHeight: 768});
  }

  async stopCast(cdp) {
    if (!cdp._startedCast) {
      return;
    }

    cdp._startedCast = false;
    await cdp.send("Page.stopScreencast");
  }

  startCastAll() {
    const promises = [];

    for (const cdp of this.targets.values()) {
       promises.push(this.startCast(cdp));
    }

    return Promise.allSettled(promises);
  }

  stopCastAll() {
    const promises = [];

    for (const cdp of this.targets.values()) {
       promises.push(this.stopCast(cdp));
    }

    return Promise.allSettled(promises);
  }
}

module.exports = { ScreenCaster };
