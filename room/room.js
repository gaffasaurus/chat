const width = window.innerWidth;
const height = window.innerHeight;

const display = document.getElementsByClassName("display")[0];
display.style += "; outline: 1.5px solid black; width: " + width/2.5 + "px; height: " + height/1.4 + "px; background-color: rgb(227, 238, 255);";

const input = document.getElementById("input");

let roomId;
const peer = new Peer();
let connectedToServer = false;

function initializePeer() {
  peer.on('open', id => {
    roomId = id;
    const h1 = document.getElementById("id");
    h1.innerHTML = "ID: " + id;
    console.log("Your ID: " + id);
    connectedToServer = true;
    connectToHost(id);
  });
}

function connectToHost(id) {
  for (let c of allConnections) {
    c.close();
  }
  let conn = peer.connect(id);
  conn.on('open', () => {
    conn.on('data', data => {
      let splitData = data.split(",");
      console.log(splitData);
    })
  })
}

initializePeer();

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
