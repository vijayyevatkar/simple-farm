const fs = require("fs");
const url = require("url");
const http = require("http");

const replaceTemplate = (element, data) => {
  let output = data.replace(/{%ID%}/g, element.id);
  output = output.replace(/{%PRODUCTNAME%}/g, element.productName);
  output = output.replace(/{%IMAGE%}/g, element.image);
  output = output.replace(/{%COUNTRY%}/g, element.from);
  output = output.replace(/{%NUTRIENTS%}/g, element.nutrients);
  output = output.replace(/{%QUANTITY%}/g, element.quantity);
  output = output.replace(/{%PRICE%}/g, element.price);
  if (!element.organic)
    output = output.replace(/{%NOTORGANIC%}/g, "not-organic");
  output = output.replace(/{%DESCRIPTION%}/g, element.description);
  return output;
};

const jsonData = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const overviewData = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  "utf-8"
);
const productData = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  "utf-8"
);
const cardData = fs.readFileSync(`${__dirname}/templates/card.html`, "utf-8");
const jsonObj = JSON.parse(jsonData);

// Simple Node HTTP Server
const server = http.createServer((request, response) => {
  const path = request.url;
  const productURL = url.parse(path);
  //Overview page
  let notFound = true;
  if (path === "/" || path === "/overview") {
    response.writeHead(200, { "Content-type": "text/html" });
    const finData = jsonObj.map((el) => replaceTemplate(el, cardData)).join("");
    const output = overviewData.replace(/{%PRODUCTCARDS%}/g, finData);
    notFound = false;
    response.end(output);
  } else if (path.startsWith("/product")) {
    //Product page
    let id = 0;
    try {
      id = productURL.query.split("=")[1];
      notFound = false;
    } catch (err) {
      console.log("err");
    }
    if (!notFound) {
      response.writeHead(200, { "Content-type": "text/html" });
      let tempData = jsonObj[id];
      if (tempData) {
        const finData = replaceTemplate(tempData, productData);
        notFound = false;
        response.end(finData);
      } else {
        notFound = true;
      }
    }
  }
  if (notFound) {
    response.end("Hello from the other side!");
  }
});
server.listen(8080, () => {
  console.log("Listening on 8080");
});
