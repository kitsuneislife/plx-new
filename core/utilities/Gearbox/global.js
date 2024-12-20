const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const MersenneTwister = require("../MersenneTwister");
//const UI_COLORS = require("@polestar/constants/ui-colors");

const UI_COLORS = {}

const _UI = {
  colors: Object.assign({},
    UI_COLORS.Branding,
    UI_COLORS.Interface,
    UI_COLORS.Misc,
    { branding: UI_COLORS.Branding },
    { interface: UI_COLORS.Interface },
  )
};

const numColor = function (color) {
  return parseInt(color.replace(/^#/, ""), 16);
};

const img2base64 = function ImageToBase64(resource) {
  return new Promise((resolve, reject) => {
    axios(resource, { responseType: 'arraybuffer' }).then((res) => {
      if (res.status !== 200) return reject(res);
      const b64 = Buffer.from(res.data, "binary").toString("base64");
      return resolve({
        b64,
        dataUri: `data:${res.headers["content-type"]};base64,${b64}`,
      });
    }).catch(err => reject(err, console.log("IMAGE TO BASE64 ERROR")));
  });
};

const nope = ":nope:339398829088571402";

const reload = () => {
  delete require.cache[require.resolve("./Gearbox")];
};

const invisibar =
  "\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u200b\u2003\u2003\u2003\u2003\u2003\u2003" +
  "\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003\u2003";

const weightedRand = (wArr = [-1]) => {
  let ttWgt = 0;
  let i;
  let rand;
  wArr.forEach((n) => {
    ttWgt += n;
  });
  rand = Math.random() * ttWgt;
  Object.keys(wArr).forEach((n) => {
    if (rand < wArr[n]) {
      i = n;
    }
    rand -= wArr[n];
  });
  return i || -1;
};

const randomize = function (min = 0, max = 100, seed) {
  if (seed === false) return ~~(Math.random() * (max - min + 1) + min);
  const RAND = new MersenneTwister(seed);
  return ~~(RAND.random() * (max - min + 1) + min);
};
global.randomize = randomize;

const wait = function (time) {
  time = typeof time === "number" ? time : 1000;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time * 1000 || 1000);
  });
};

const miliarize = function (numstring, strict, char = ".") {
  try {
    if (typeof numstring === "number") {
      numstring = numstring.toString() || "0";
    }
    const split = numstring.split(".");
    [numstring] = split;
    let numstringExtra = split[1] || "";
    if (numstringExtra.length > 1) numstringExtra = ` .${numstringExtra}`;
    else numstringExtra = "";

    if (numstring.length < 4) return numstring;

    const stashe = numstring
      .replace(/\B(?=(\d{3})+(?!\d))/g, char)
      .toString();

    const suffixes = ["", "K", "Mi", "Bi", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Un"];

    if (strict) {
      let stash = stashe;
      if (strict === "soft") {
        stash = stashe.split(char);
        const len = stash.length;
        if (len > suffixes.length) return "---"; // Out of range
        if (stash[len - 1] === "000") {
          return `${stash[0]}${char}${stash[1]?.slice(0, 2)}${numstringExtra}${suffixes[len - 1]}`;
        }
        return stashe + numstringExtra;
      }
      return stash;
    }

    const stash = stashe.split(char);
    const len = stash.length;
    if (len > suffixes.length) return "---"; // Out of range

    return `${stash[0]}${suffixes[len - 1]}`;
  } catch (err) {
    return "---";
  }
};

const shuffle = function (array, seed) {
  let currentIndex = array.length;

  if (seed) {
    while (currentIndex !== 0) {
      let randomIndex = ~~(randomize(0, currentIndex, seed));
      currentIndex -= 1;
      mutateRandom(array, currentIndex, randomIndex);
    }
  } else {
    while (currentIndex !== 0) {
      let randomIndex = ~~(Math.random() * currentIndex);
      currentIndex -= 1;
      mutateRandom(array, currentIndex, randomIndex);
    }
  }
  return array;
};

const capitalize = function (string) {
  return (`${string ?? ""}`).charAt(0).toUpperCase() + (`${string ?? ""}`).slice(1);
};

const objCount = function (array, what) {
  let it = 0;
  array.forEach((i) => {
    if (i === what) it += 1;
  });
  return it;
};

const resolveFile = function (resource) {
  if (Buffer.isBuffer(resource)) return Promise.resolve(resource);

  if (typeof resource === "string") {
    if (/^https?:\/\//.test(resource)) {
      return axios(resource, { responseType: "arraybuffer" }).then((res) => res.data);
    }
    return new Promise((resolve, reject) => {
      const file = path.resolve(resource);
      fs.stat(file, (err, stats) => {
        if (err) return reject(err);
        if (!stats?.isFile())
          return reject(new Error("[FILE NOT FOUND] " + file));
        fs.readFile(file, (err2, data) => {
          if (err2) reject(err2);
          else resolve(data);
        });
        return null;
      });
    });
  }
  if (typeof resource.pipe === "function") {
    return new Promise((resolve, reject) => {
      const buffers = [];
      resource.once("error", reject);
      resource.on("data", (data) => buffers.push(data));
      resource.once("end", () => resolve(Buffer.concat(buffers)));
    });
  }
  return Promise.reject(new TypeError("REQ_RESOURCE_TYPE"));
};

const file = function (file, name) {
  const finalFile = file instanceof Buffer ? file : fs.readFileSync(file);
  const ts = Date.now();
  if (typeof name === "undefined" && typeof file === "string")
    name = path.basename(file);
  else name = `${ts}.png`;
  const fileObject = {
    attachment: finalFile,
    name,
  };
  return fileObject;
};

const exec = function (command, options) {
  return new Promise((res, rej) => {
    let output = "";

    const write = (data) => {
      output += data;
    };
    const cmd = require("child_process").exec(command, options);

    cmd.stderr.on("data", write);
    cmd.stdout.on("data", write);
    cmd.on("error", write);
    cmd.once("exit", (code) => {
      cmd.stderr.off("data", write);
      cmd.stdout.off("data", write);
      cmd.off("error", write);

      if (code !== 0) rej(new Error(`Command failed: ${command}\n${output}`));
      res(output);
    });
  });
};

function mutateRandom(array, currentIndex, randomIndex) {
  const temporaryValue = array[currentIndex];
  array[currentIndex] = array[randomIndex];
  array[randomIndex] = temporaryValue;
}

module.exports = {
  _UI,
  numColor,
  img2base64,
  nope,
  reload,
  invisibar,
  Embed: Discord.EmbedBuilder,
  RichEmbed: Discord.EmbedBuilder, // legacy comp
  weightedRand,
  randomize,
  wait,
  miliarize,
  shuffle,
  capitalize,
  objCount,
  resolveFile,
  file,
  exec
};
