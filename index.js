const PORT = process.env.PORT || 8080;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
// const fetch = require("node-fetch");

const app = express();

const memesWebsites = [
  {
    name: "programmerhumor",
    address: "https://programmerhumor.io/",
    base: "",
  },
  // {
  //   name: "commitstrip",
  //   address: "https://commitstrip.com/",
  //   base: "",
  // },
];

let memes = [];

const fetchMemes = async () => {
  for (let page = 0; page <= 20; page++) {
    const response = await fetch(`https://programmerhumor.io/page/${page}/`);
    const html = await response.text();
    const $ = cheerio.load(html);

    $("a")
      .filter(function () {
        return $(this).hasClass("g1-frame");
      })
      .each(async function (index) {
        const title = $(this).attr("title");
        const img = $(this).find("img");
        const imageUrl = img.data("src");

        const payload = {
          title,
          imageUrl,
          // source: memesWebsite.name,
        };

        const doubled = memes.find(
          (meme) => JSON.stringify(meme) === JSON.stringify(payload)
        );
        if (!doubled) {
          memes.push(payload);
        }
      });
  }
};

app.get("/", async (req, res, next) => {
  return res.send("Welcome to the programming memes API");
});

app.get("/api/memes", async (req, res, next) => {
  try {
    await fetchMemes(1938);
    return res.json(memes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running...");
});
