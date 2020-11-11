import chalk from "chalk";
import fs from "fs";
import glob from "glob";

const defaults = {
  path: "src/**/*.az.js",
  settings: "settings",
  name: "name",
};

const getFinalArgs = (args) => {
  let config = undefined;
  try {
    const configFile = fs.readFileSync("function.config.json", "utf-8");
    config = JSON.parse(configFile);
  } catch {
    config = {};
  }

  return {
    path: config.path || defaults.path,
    settings: args.settings || config.settings || defaults.settings,
    name: args.name || config.name || defaults.name,
  };
};

const getSettings = (fileName, fileString, settingsVar) => {
  const regex = new RegExp(
    `${settingsVar}\\s*=\\s*(?<binding>\\{([\\s\\S\\n])+\\})`
  );

  const settingsMatch = fileString.match(regex);

  if (!settingsMatch) {
    console.error(
      `${fileName} is missing settings option`,
      chalk.red.bold("ERROR")
    );
    process.exit(1);
  }
  const bindingGroup = settingsMatch.groups.binding;

  let bracket = 1;
  let i = 1;
  for (let length = bindingGroup.length; i < length; i++) {
    const char = bindingGroup.charAt(i);
    switch (char) {
      case "{":
        bracket++;
        break;
      case "[":
        bracket++;
        break;
      case "}":
        bracket--;
        break;
      case "]":
        bracket--;
        break;
    }
    if (bracket === 0) break;
  }

  const settings = bindingGroup.substring(0, i + 1);
  console.log(`Settings created: ${fileName}`);
  return new Function(`return ${settings};`)();
};

const getName = (fileName, fileString, nameVar) => {
  const regex = new RegExp(`${nameVar}\\s*=\\s*(?<name>[\\S]*)`, "g");
  const nameMatch = fileString.match(regex);

  if (!nameMatch || nameMatch.length == 0) {
    console.error(
      `${fileName} is missing name option`,
      chalk.red.bold("ERROR")
    );
    process.exit(1);
  }
  const name =
    !nameMatch || nameMatch.length == 0
      ? fileName.split("/").pop().split(".")[0]
      : new Function(
          `return ${nameMatch.length > 1 ? nameMatch[1] : nameMatch[0]}`
        )();

  console.log("folder name: " + name);

  return name;
};

export const compile = async (args) => {
  args = getFinalArgs(args);
  glob(args.path, null, (er, files) => {
    console.log(files);
    for (const f of files) {
      const mod = fs.readFileSync(f, "utf-8");

      const bindings = getSettings(f, mod, args.settings);

      const name = getName(f, mod, args.name);

      bindings.scriptFile = "../" + f;

      const fnjson = JSON.stringify(bindings, null, 4);

      fs.promises.mkdir(`${name}`, { recursive: true }).then(() => {
        const functionName = `${name}/function.json`;
        fs.writeFileSync(functionName, new Uint8Array(Buffer.from(fnjson)));
        console.log("function.json created: ", chalk.green.bold(functionName));
      });
    }
  });
};
