#!/usr/bin/env node
require = require("esm")(module /*,options*/);

const yargs = require("yargs");

const { compile } = require("../src/index");

yargs.command(
  "compile",
  "Generate function.json files",
  (yargs) =>
    yargs
      .usage(
        "az-fn compile -p <GLOB PATTERN, default: src/**/*.az.js> -s <SETTINGS VARm default: settings> -n <NAME VAR, default: name>"
      )
      .option("s", {
        alias: "settings",
        describe: "Name of the 'settings' variable",
        type: "string",
      })
      .option("n", {
        alias: "name",
        describe: "Name of the 'name' variable",
        type: "string",
      }).yargs,
  async (argv) => {
    await compile(argv);
  }
).argv;
