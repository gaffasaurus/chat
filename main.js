const width = window.innerWidth;
const height = window.innerHeight;

const chatRoom = document.getElementById("chatroom");
const home = document.getElementById("home");
const messageBoard = document.getElementById("message-board");
const inputMessage = document.getElementById("input-message");


const joinRoomField = document.getElementById("join-room-field");
joinRoomField.addEventListener("keypress", e => {
  if (e.keyCode === 13) {
    const value = joinRoomField.value;
    joinRoom();
  }
});

const allConnections = [];
const peer = new Peer();
let conn;
let peerId;
initializePeer();

function initializePeer() {
  peer.on("open", id => {
    console.log("My ID: " + id);
    peerId = id;
  });

  peer.on("error", err => {
    alert("" + err);
  });
}

function createRoom() {
  console.log("room created");
  const displayId = document.getElementById("display-id");
  displayId.innerHTML = "ID: " + peerId;
  peer.on("connection", conn => {
    console.log("Received connection");
  });
  updateAllConnections(peer);
}

function joinRoom() {
  validateId(joinRoomField.value);
}

function validateId(id) {
  conn = peer.connect(id);
  conn.on('open', () => {
    console.log("connected!");
    updateAllConnections(peer);
    const displayId = document.getElementById("display-id");
    displayId.innerHTML = "ID: " + conn.peer;
    enterRoom('join');
  });
}

function enterRoom(action) {
  const messageBoardWidth = width/1.7;

  home.style.display = "none";
  chatRoom.style.display = "flex";
  messageBoard.style.width = messageBoardWidth + "px;";
  messageBoard.style.height= height/1.4 + "px";

  inputMessage.addEventListener("keypress", e => {
    if (e.keyCode === 13) {
      sendMessage();
    }
  });
  if (action === "create") {
    createRoom();
  } else {
  }
}

function updateAllConnections(peer) {
  if (!allConnections.includes(peer)) {
    allConnections.push(peer);
  }
}

function sendMessage() {
  const value = inputMessage.value;
  console.log(allConnections);
  for (let connection of allConnections) {
    connection.send(value);
  }
  displayMessage(value);
  inputMessage.value = "";
}

function displayMessage(text) {
  const p = document.createElement("p");
  const node = document.createTextNode(text);
  p.appendChild(node);
  messageBoard.appendChild(p);
  messageBoard.scrollTo(0, messageBoard.scrollHeight);
}

// function validateId(id) {
//   const dataConnection = peer.connect(id);
//   const joinMsg = document.getElementById("error-msg");
//   joinMsg.style = "font-size: 16px";
//   joinMsg.innerHTML = "Connecting...";
//   console.log(dataConnection);
//   dataConnection.on('open', () => {
//     joinRoom();
//     return;
//   });
//   setTimeout(() => {
//     joinMsg.innerHTML = "Unable to connect to the room. Check ID and try again.";
//     joinMsg.style.color = "red";
//   }, 5000);
// }
