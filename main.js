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
const allMessages = [];
const peer = new Peer();
let peerId;
let isHost = false;
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
  isHost = true;
  console.log("room created");
  const displayId = document.getElementById("display-id");
  displayId.innerHTML = "ID: " + peerId;
  peer.on("connection", conn => {
    console.log("Received connection");
    updateAllConnections(conn);
    console.log(allConnections);
  });
  enterRoom('create');
}

function joinRoom() {
  // TODO: Block connecting to people joining rooms
  // peer.on('connection', c => {
  //   c.on('open', () => {
  //     c.send("ID does not accept incoming connections");
  //     setTimeout(() => {
  //       c.close();
  //     }, 500);
  //     c.on('data', () => {
  //       alert(data);
  //     });
  //   });
  // });
  validateId(joinRoomField.value);
}

function validateId(id) {
  let conn = peer.connect(id);
  conn.on('open', () => {
    console.log("connected!");
    updateAllConnections(conn);
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
      sendMessage(inputMessage.value);
    }
  });
  // if (action === "create") {
  //   createRoom();
  // }
    // conn.on('data', data => {
    //   console.log("received data");
    //   sendMessage(data);
    // });
}

function updateAllConnections(conn) {
  if (!allConnections.includes(conn)) {
    allConnections.push(conn);
  }
}

function sendMessage(msg) {
  console.log(allConnections);
  for (let connection of allConnections) {
    connection.send(msg);
  }
  displayMessage(msg);
  inputMessage.value = "";
  allMessages.push({
    sender: peer,
    message: msg
  });
  console.log(allMessages);
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
