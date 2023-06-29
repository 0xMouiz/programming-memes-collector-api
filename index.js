const PORT = process.env.PORT || 8080;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const app = express();

const memesWebsites = [
  {
    name: "programmerhumor",
    address: "https://programmerhumor.io/",
    base: "",
  },
  //   {
  //     name: "commitstrip",
  //     address: "https://commitstrip.com/",
  //     base: "",
  //   },
];

let memes = [];

const fetchMemes = async () => {
  for await (const memesWebsite of memesWebsites) {
    // let imageUrl;
    // const browser = await puppeteer.launch({ headless: "new" });
    // const page = await browser.newPage();

    // await page.goto(memesWebsite.address, {
    //   waitUntil: "networkidle0",
    //   //   timeout: 60000,
    // });

    // let scrollHeight = await page.evaluate(() => {
    //   return document.documentElement.scrollHeight;
    // });

    // let previousScrollHeight = 0;

    // while (scrollHeight > previousScrollHeight) {
    //   previousScrollHeight = scrollHeight;
    //   await page.evaluate(() => {
    //     window.scrollTo(0, document.documentElement.scrollHeight);
    //   });
    //   await page.waitForTimeout(1000); // ! maybe gotta be removed
    //   scrollHeight = await page.evaluate(() => {
    //     return document.documentElement.scrollHeight;
    //   });
    // }

    // const html = await page.content();
    // const $ = cheerio.load(html);

    await axios
      .get(memesWebsite.address)
      .then((response) => {
        const html = response.data;
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
              source: memesWebsite.name,
            };

            const doubled = memes.find(
              (meme) => JSON.stringify(meme) === JSON.stringify(payload)
            );
            if (!doubled) {
              memes.push(payload);
            }
          });
      })
      .catch((err) => {
        // Handle the error
      });
  }
};

app.get("/", async (req, res, next) => {
  return res.send("Welcome to the programming memes API");
});

app.get("/api/memes", async (req, res, next) => {
  try {
    await fetchMemes();
    return res.json(memes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running...");
});
