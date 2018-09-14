const { JSDOM } = require("jsdom");

const options = {
};
const dom = new JSDOM(`
  <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">

    <path d="M 100 100 L 300 100 L 200 300 z" fill="orange" stroke="black" stroke-width="3" />
    <rect x="10" y="10" width="100" height="100"/>
    <circle cx="100" cy="100" r="100"/>
    <ellipse cx="60" cy="60" rx="50" ry="25"/>
    <line x1="20" y1="100" x2="100" y2="20" stroke-width="2" stroke="black"/>
    <polyline points="0,40 40,40 40,80 80" fill="white" stroke="#D07735" stroke-width="6" />
    <polygon points="60,20 100,40 100,80 60,100 20,80 20,40"/>

  </svg>
`, options);

console.log(dom.window.document.firstChild.querySelector('svg'));
