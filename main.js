const width = window.innerWidth;
const height = window.innerHeight;

function enterRoom(action) {
  const chatRoom = document.getElementById("chatroom");
  const home = document.getElementById("home");
  const messageBoard = document.getElementById("message-board");
  const inputMessage = document.getElementById("input-message");
  const messageBoardWidth = width/1.7;

  home.style.display = "none";
  chatRoom.style.display = "flex";
  messageBoard.style.width = messageBoardWidth + "px;";
  messageBoard.style.height= height/1.4 + "px";

  inputMessage.addEventListener("keypress", e => {
    if (e.keyCode === 13) {
      const value = inputMessage.value;
      alert(value);
      inputMessage.value = "";
    }
  });
  if (action === "create") {
    createRoom();
  }
}

const joinRoomField = document.getElementById("join-room-field");
joinRoomField.addEventListener("keypress", e => {
  if (e.keyCode === 13) {
    const value = joinRoomField.value;
    alert(value);
  }
});

const peer = new Peer();
let conn;
initializePeer();
let peerId;
function createRoom() {
  console.log("room created");
  const displayId = document.getElementById("display-id");
  displayId.innerHTML = "ID: " + peerId;
  peer.on("connection", conn => {
    alert("Received connection");
  });
}

function joinRoom() {
  validateId(joinRoomField.value);
}

function validateId(id) {
  conn = peer.connect(id);
  conn.on('open', () => {
    console.log("connected!");
  });
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

function initializePeer() {
  peer.on("open", id => {
    console.log("My ID: " + id);
    peerId = id;
  });

  peer.on("error", err => {
    alert("" + err);
  });
}
