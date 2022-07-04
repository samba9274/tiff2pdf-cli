#!/usr/bin/env node

const UTIF = require("utif");
const jpeg = require("jpeg-js");
const pdf = require("pdfjs");
const fs = require("fs");
const { program } = require("commander");
program
  .name(require("../package.json").name)
  .description(require("../package.json").description)
  .version(require("../package.json").version)
  .requiredOption("-i, --input <string>", "input tiff file")
  .option("-o, --output <string>", "output pdf file", "output.pdf")
  .action((options) => {
    let arrayBuffer = null;
    try {
      arrayBuffer = fs.readFileSync(options.input);
    } catch (error) {
      console.error(`${options.input} not found`);
    }
    if (arrayBuffer) {
      const doc = new pdf.Document();
      doc.pipe(fs.createWriteStream(options.output));
      UTIF.decode(arrayBuffer).forEach((page) => {
        UTIF.decodeImage(arrayBuffer, page);
        doc.image(
          new pdf.Image(
            jpeg.encode(
              {
                data: UTIF.toRGBA8(page),
                width: page.width,
                height: page.height,
              },
              100
            ).data
          )
        );
      });
      doc.end();
    }
  });

program.parse();
