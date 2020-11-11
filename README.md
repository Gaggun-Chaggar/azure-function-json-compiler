# azure-function-json-compiler

## Summary

This project aims to free developers from the folder constraints of a Node.js Azure Fuctions project.
Currently, with Azure Functions, top level folders with `function.json` files are required, which can lead to medium sizes api projects becoming unweildly.

This CLI aims to resolve this issue by defining the function name, settings and function in a single js file, then extracting the `function.json` (and add a `scriptFile` reference) and name from the file on command. This command can be easily embedded in a deployment workflow.

Example file:

```javascript
// path: src/users/get.az.js
const settings = {
  bindings: [
    {
      authLevel: "anonymous",
      type: "httpTrigger",
      direction: "in",
      name: "req",
      route: "users",
      methods: ["get"],
    },
    {
      type: "http",
      direction: "out",
      name: "$return",
    },
  ],
};

const name = "user_get";

const run = async (context, req) => ({ body: { user: "I am a user" } });

module.exports = { settings, name, run };
```

This example would generate a `user_get` folder, with a `function.json` file, with content:

```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "route": "users",
      "methods": ["get"]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "$return"
    }
  ],
  "scriptFile": "../src/users/get.az.js
}

```

## Installation

```
npm i -D azure-function-json-compiler
```

## Commands

### `compile`

The compile command generates the `function.json` files for a project.

#### Command Line Arguments

There are command line arguments for setting the names for the settings, and name variables.

- `-s`: The name of the variable which contains the function.json content (optional)
- `-n`: The name of the variable which is equal to the desired folder name (optional)

#### `function.config.json`

Configuration can be set using a `function.config.json` file, located in the project root.
In this file, the glob pattern to azure function js files can be specified.

```json
{
  "path": "src/**/*.az.js",
  "settings": "settings",
  "name": "name"
}
```

#### Default Values

Below are the default values for each of the arguments.

```json
{
  "path": "src/**/*.az.js",
  "settings": "settings",
  "name": "name"
}
```

## Limitations

This CLI does can not handle variable references, as such the name and settings variables must use literals.
