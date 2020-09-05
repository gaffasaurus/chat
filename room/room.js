const width = window.innerWidth;
const height = window.innerHeight;
console.log(width, height/1.5)

const display = document.getElementsByClassName("display")[0];
display.style = "outline: 1.5px solid black; width: " + width/2.5 + "px; height: " + height/1.4 + "px; background-color: rgb(227, 238, 255);)";

const input = document.getElementById("input");

function sendMessage() {
  const text = input.value;
  input.value = "";
  const p = document.createElement("p");
  const node = document.createTextNode(text);
  p.appendChild(node);
  display.appendChild(p);
  display.scrollTo(0, display.scrollHeight);
}

input.addEventListener('keypress', e => {
  if (e.keyCode === 13) {
    sendMessage();
  }
})
