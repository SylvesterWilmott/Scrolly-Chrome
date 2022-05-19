"use strict";

let track;
let progressBar;
let accent = "rgb(50, 50, 50)";

function start() {
  if (pageIsArticle()) {
    generateProgressBar();
  }
}

function generateProgressBar() {
  const themeColor = extractColor();
  const fixedHeaderColor = getHeaderColor();

  if (themeColor) {
    if (themeColor === fixedHeaderColor) {
      return;
    }
    accent = themeColor;
  }

  track = document.createElement("div");
  progressBar = document.createElement("div");

  defineStyles(accent);

  track.appendChild(progressBar);
  document.body.appendChild(track);

  updateProgress();
  addListener();
}

function getHeaderColor() {
  let header = document.querySelectorAll("header");

  if (header.length) {
    for (const h of header) {
      if (
        window.getComputedStyle(h).position === "fixed" ||
        window.getComputedStyle(h).position === "sticky"
      ) {
        let backgroundColor = getColor(h);
        if (backgroundColor) {
          let rgb = makeRgb(backgroundColor);
          return "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
        }
      }
    }
  }

  return undefined;
}

function extractColor() {
  let nodes = [...document.querySelectorAll("div, span, p > a")];
  let colors = [];

  for (const node of nodes) {
    let color = getColor(node);

    if (color) {
      let rgb = makeRgb(color);
      let gray = isGray(rgb);
      let l = 0.2126 * rgb.r + 0.7152 * rgb.b + 0.0722 * rgb.b;

      if (l > 35 && l < 180 && !gray) {
        colors.push("rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
      }
    }
  }

  if (colors.length) {
    return mode(colors);
  } else {
    return undefined;
  }
}

function isGray(rgb) {
  let r = parseInt(rgb.r);
  let g = parseInt(rgb.g);
  let b = parseInt(rgb.b);
  let average = (r + g + b) / 3;
  let range = 10;

  if (
    average + range >= r &&
    average - range <= r &&
    average + range >= g &&
    average - range <= g &&
    average + range >= b &&
    average - range <= b
  ) {
    return true;
  }

  return false;
}

function getColor(node) {
  let computed = getComputedStyle(node);
  let transparent = "rgba(0, 0, 0, 0)";

  if (
    computed.backgroundImage !== "none" ||
    computed.backgroundImage === transparent
  ) {
    return undefined;
  }

  let backgroundColor = computed.backgroundColor;

  if (node.tagName === "A") {
    if (!backgroundColor || backgroundColor === transparent) {
      return computed.color;
    }
  }

  return backgroundColor;
}

function makeRgb(color) {
  let rgb = color
    .replace(/^(rgb|rgba)\(/, "")
    .replace(/\)$/, "")
    .replace(/\s/g, "")
    .split(",");

  let r = rgb[0];
  let g = rgb[1];
  let b = rgb[2];

  return {
    r: r,
    g: g,
    b: b,
  };
}

function addListener() {
  document.addEventListener("scroll", updateProgress, false);
}

function updateProgress() {
  let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  let height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  let footer = document.querySelectorAll("footer");

  if (footer.length) {
    for (const f of footer) {
      if (f.offsetWidth == document.documentElement.clientWidth) {
        height = height - f.offsetHeight;
      }
    }
  }

  let progressPercent = (scrollTop / height) * 100 + "%";

  progressBar.style.width = progressPercent;
}

function defineStyles(accent) {
  track.style.background = "transparent";
  track.style.width = "100%";
  track.style.height = "4px";
  track.style.position = "fixed";
  track.style.top = "0";
  track.style.left = "0";
  track.style.zIndex = "999999";

  progressBar.style.width = "0%";
  progressBar.style.height = "4px";
  progressBar.style.position = "absolute";
  progressBar.style.top = "0";
  progressBar.style.left = "0";
  progressBar.style.background = accent;
}

function mode(arr) {
  return arr
    .sort(
      (a, b) =>
        arr.filter((v) => v === a).length - arr.filter((v) => v === b).length
    )
    .pop();
}

function pageIsArticle() {
  let options = { scoreThreshold: 40, nodeLengthThrehold: 150 };
  let score = 0;

  const metaType = document.head.querySelector('[property="og:type"][content]');

  if (metaType && metaType.content === "article") {
    return true;
  }

  let nodes = [];

  const textNodes = document.querySelectorAll("p, pre, article");
  const brNodes = document.querySelectorAll("div > br");

  if (textNodes.length) {
    for (const node of textNodes) {
      nodes.push(node);
    }
  }

  if (brNodes.length) {
    for (const node of brNodes) {
      nodes.push(node.parentNode);
    }
  }

  for (const node of nodes) {
    if (node.innerText.length > options.nodeLengthThrehold) {
      score += Math.sqrt(node.innerText.length - options.nodeLengthThrehold);
    }
  }

  if (score > options.scoreThreshold) {
    return true;
  }

  return false;
}

start();
