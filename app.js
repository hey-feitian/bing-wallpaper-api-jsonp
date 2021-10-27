const http = require("http");
const express = require("express");
const app = express();
const port = process.env.PORT || 80;

app.get("/", function (req, resp) {
  const { format = "js", idx = 0, n = 1, mkt = "en-US", callback } = req.query;
  const bingAPI = `http://cn.bing.com/HPImageArchive.aspx?format=${format}&idx=${idx}&n=${n}&mkt=${mkt}`;

  http.get(bingAPI, function (res) {
    const { statusCode } = res;
    if (statusCode !== 200) {
      resp.json({ error: "HTTP request failed" });
    }

    res.setEncoding("utf8");
    let rawData = "";

    res.on("data", (chunk) => (rawData += chunk));

    res.on("end", () => {
      if (format === "js") {
        try {
          const JSONData = JSON.parse(rawData);
          if (callback) {
            resp.jsonp(JSONData);
          } else {
            resp.json(JSONData);
          }
        } catch (e) {
          resp.status(500).json({ error: "Parse failed" });
        }
      } else if (format === "xml" || format === "rss") {
        resp.type("text/xml").send(rawData);
      }
    });
  });
});

app.listen(port, function () {
  console.log(`Listening on http://localhost:${port}`);
});
