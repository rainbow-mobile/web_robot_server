const express = require("express");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const csv = require("fast-csv");
const uuid = require("uuid");
const { homedir } = require("os");
const logger = require("../log/logger");

const findKeyword = (line) => {
  const keyword = [
    "repeat",
    "begin",
    "wait",
    "script",
    "socket_func",
    "halt",
    "end",
    "general_thread",
    "map",
    "else if",
    "if",
    "else",
    "move",
    "break",
    "continue",
    "folder",
    "assign",
    "subp",
  ];
  const result = [];
  for (const key of keyword) {
    if (line.includes(key)) {
      result.push(key);
    }
  }
  return result[0];
};

const findValue = (line) => {
  return line.split("(")[1].split(")")[0];
};

const findValueSub = (keyword, line) => {
  return line.split(keyword)[1].replace(" ", "");
};
const findSocketChildren = (line) => {
  return line.split("{")[1].split("}")[0];
};

const textToTreeData = async (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const stack = [];
  const root = { key: "0", label: "root", children: [] };

  var start_script = false;
  var start_folder = false;
  var start_assign = false;
  var script_value = "";

  stack.push(root);

  lines.forEach((line) => {
    const keyword = findKeyword(line);
    const new_tree = line.includes("{");
    const end_tree = line.includes("}") && !line.includes("{");

    if (keyword == "begin") {
      const new_node = { label: "begin", children: [] };
      stack[stack.length - 1].children.push(new_node);
      // stack.push(new_node);
    } else if (keyword == "wait") {
      const value = findValue(line);
      // const new_node = { key: uuid.v4(), realkey: key, label: 'wait', data: value, children: [] };
      const new_node = { label: "wait", data: value, children: [] };
      stack[stack.length - 1].children.push(new_node);
    } else if (keyword == "script") {
      start_script = true;
    } else if (keyword == "subp") {
      const value = findValueSub(keyword, line);
      const new_node = { label: "subp", data: value, children: [] };
      stack[stack.length - 1].children.push(new_node);
    } else if (keyword == "assign") {
      start_assign = true;
    } else if (keyword == "folder") {
      const value = findValue(line);
      const new_node = { label: "folder", data: value, children: [] };
      stack[stack.length - 1].children.push(new_node);
      stack.push(new_node);
      start_folder = true;
    } else if (keyword == "socket_func") {
      const value = findValue(line);
      const socket_child = findSocketChildren(line);
      const new_node = {
        label: "socket_func_" + value,
        data: socket_child,
        children: [],
      };
      stack[stack.length - 1].children.push(new_node);
    } else if (keyword == "repeat") {
      const value = findValue(line);
      const new_node = { label: "repeat", data: value, children: [] };
      stack[stack.length - 1].children.push(new_node);
      stack.push(new_node);
    } else if (keyword == "end") {
      // const new_node = { key: uuid.v4(), realkey: key, label: 'end', children: [] };
      const new_node = { label: "end", children: [] };
      stack[stack.length - 1].children.push(new_node);
    } else if (keyword == "move") {
      const value = findValue(line);
      const new_node = {
        icon: "pi pi-fw pi-forward",
        key: uuid.v4(),
        label: "move",
        data: value,
        children: [],
      };
      stack[stack.length - 1].children.push(new_node);
    } else if (keyword == "halt") {
      const new_node = { label: "halt", children: [] };
      stack[stack.length - 1].children.push(new_node);
    } else if (keyword == "if") {
      const value = findValue(line);
      const new_node = { label: "if", data: value, children: [] };
      stack[stack.length - 1].children.push(new_node);
      stack.push(new_node);
    } else if (keyword == "else if") {
      const value = findValue(line);
      const new_node = { label: "else if", data: value, children: [] };
      stack[stack.length - 1].children.push(new_node);
      stack.push(new_node);
    } else if (keyword == "else") {
      const new_node = { label: "else", children: [] };
      stack[stack.length - 1].children.push(new_node);
      stack.push(new_node);
    } else if (keyword == "break") {
      const new_node = { label: "break", children: [] };
      stack[stack.length - 1].children.push(new_node);
    } else if (keyword == "continue") {
      const new_node = { label: "continue", children: [] };
      stack[stack.length - 1].children.push(new_node);
    } else if (keyword == "general_thread") {
      const new_node = { label: "general_thread", children: [] };
      stack[stack.length - 1].children.push(new_node);
      stack.push(new_node);
    } else if (keyword == "map") {
      const new_node = { label: "map", children: [] };
      stack[stack.length - 1].children.push(new_node);
    } else {
      if (start_script) {
        if (end_tree) {
          const new_node = {
            label: "script",
            data: script_value.trimEnd(),
            children: [],
          };
          stack[stack.length - 1].children.push(new_node);

          start_script = false;
          script_value = "";
        } else {
          line.trim();
          script_value += line + "\n";
        }
      } else if (start_assign) {
        if (end_tree) {
          const new_node = {
            label: "assign",
            data: script_value.trimEnd(),
            children: [],
          };
          stack[stack.length - 1].children.push(new_node);

          start_assign = false;
          script_value = "";
        } else {
          line.trim();
          script_value += line + "\n";
        }
      } else if (end_tree) {
        stack.pop();
      }
    }
  });

  return [root];
};

async function parse(dir) {
  return new Promise(async (resolve, reject) => {
    fs.open(dir, "r", (err, fd) => {
      if (err) {
        reject();
      } else {
        const file = fs.readFileSync(dir, "utf-8");

        // console.log(file);
        const result = textToTreeData(file);

        // console.log(result);
        resolve(result);
      }
    });
  });
}

async function save(dir, data) {
  return new Promise(async (resolve, reject) => {
    const text = treeToText(data);
    // console.log(text);
    fs.writeFile(dir, text, (err) => {
      if (err) {
        logger.error("Save File " + dir + " Error :", err);
        reject(err);
      }
      logger.info("Save File Success : ", dir);
      resolve(text);
    });
  });
}

const treeToText = (tree) => {
  let text = "";

  const traverse = (node, indentLevel) => {
    let indent = "";
    if (indentLevel == 0) {
    } else {
      indent = " ".repeat((indentLevel - 1) * 4);
    }

    switch (node.label) {
      case "begin":
        text += `${indent}begin\n`;
        break;
      case "wait":
        text += `${indent}wait (${node.data})\n`;
        break;
      case "repeat":
        text += `${indent}repeat (${node.data}){\n`;
        break;
      case "folder":
        text += `${indent}folder (${node.data}){\n`;
        break;
      case "halt":
        text += `${indent}halt\n`;
        break;
      case "general_thread":
        text += `${indent}general_thread{\n`;
        break;
      case "end":
        text += `${indent}end\n`;
        break;
      case "move":
        text += `${indent}move (${node.data})\n`;
        break;
      case "subp":
        text += `${indent}subp ${node.data}\n`;
        break;
      case "if":
        text += `${indent}if (${node.data}){\n`;
        break;
      case "else if":
        text += `${indent}else if (${node.data}){\n`;
        break;
      case "else":
        text += `${indent}else{\n`;
        break;
      case "break":
        text += `${indent}break\n`;
        break;
      case "continue":
        text += `${indent}continue\n`;
        break;
      case "map":
        text += `${indent}map\n`;
        break;
      case "script": {
        const lines = node.data.split("\n");
        const childindent = " ".repeat(indentLevel * 4);

        text += `${indent}script{\n`;
        // text += `${indent}script{\n${indent}${node.data}\n${indent}}\n`;

        lines.forEach((line) => {
          text += `${childindent}${line}\n`;
        });

        text += `${indent}}\n`;

        break;
      }
      case "assign": {
        const lines = node.data.split("\n");
        const childindent = " ".repeat(indentLevel * 4);

        text += `${indent}assign{\n`;
        // text += `${indent}script{\n${indent}${node.data}\n${indent}}\n`;

        lines.forEach((line) => {
          text += `${childindent}${line}\n`;
        });

        text += `${indent}}\n`;

        break;
      }
    }

    if (node.label.includes("socket_func")) {
      const id = node.label.split("_")[2];
      text += `${indent}socket_func(${id}){${node.data}}\n`;
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => traverse(child, indentLevel + 1));
      if (node.label != "root") text += `${indent}}\n`;
    }
  };

  // Start traversal from the root
  tree.forEach((rootNode) => traverse(rootNode, 0));

  return text.trim();
};
const treeTotext = (tree) => {};

async function list(dir) {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  let list = [];

  files.map((file) => {
    if (file.name.split(".").length > 1) {
      if (file.name.split(".")[1] == "task") {
        list.push(file.name);
      }
    }
  });
  return list;
}

module.exports = {
  parse: parse,
  list: list,
  save: save,
};
