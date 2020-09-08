const width = window.innerWidth;
const height = window.innerHeight;

const chatRoom = document.getElementById("chatroom");
const home = document.getElementById("home");
const chooseUsername = document.getElementById("choose-username");
const messageBoard = document.getElementById("message-board");
const inputMessage = document.getElementById("input-message");
const sendButton = document.getElementById("send-message");

const joinRoomField = document.getElementById("join-room-field");
joinRoomField.addEventListener("keypress", e => {
  if (e.keyCode === 13) {
    const value = joinRoomField.value;
    chooseUsername();
  }
});
const joinMsg = document.getElementById("error-msg");


let allConnections = [];
let allMembers = [];
let allMessages = [];
const peer = new Peer();
let peerId;
let username;
let isHost = false;
initializePeer();

function enterUsername(action) {
  chooseUsername.style.display = "flex";
  home.style.display = "none";
  const usernameField = document.getElementById("username-field");
  usernameField.addEventListener("keypress", e => {
    if (e.keyCode === 13) {
      username = usernameField.value;
      if (action === "create") {
        createRoom();
      } else {
        joinRoom();
      }
    }
  });
  const submitUsername = document.getElementById("submit-username");
  submitUsername.addEventListener("click", e => {
    username = usernameField.value;
    if (action === "create") {
      createRoom();
    } else {
      joinRoom();
    }
  });
}

function initializePeer() {
  peer.on("open", id => {
    console.log("My ID: " + id);
    peerId = id;
    const displayId = document.getElementById("display-id");
    displayId.innerHTML = "ID: " + peerId;
  });

  peer.on("error", err => {
    if (home.style.display != "none") {
      joinMsg.innerHTML = err;
      joinMsg.style.color = "red";
    } else {
      alert(err);
    }
  });
}

function createRoom() {
  isHost = true;
  console.log("room created");
  addMember(peerId, username);
  peer.on("connection", conn => {
    console.log("Received connection");
    updateAllConnections(conn);
    // updateAllMembers();
    // for (let c of allConnections) {
    //   // c.send(allConnections);
    //   c.send(allMembers);
    conn.on('data', data => {
      switch (data[0]) {
        case "message": {
          sendMessage(conn.peer, data[1], data[2]);
          break;
        }
        case "username": {
          addMember(data[1], data[2]);
          for (let c of allConnections) {
            if (c && c.open) c.send(['members', allMembers]);
          }
          updateMemberDisplay();
        }

      }
    })
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
  joinMsg.style = "font-size: 16px";
  joinMsg.innerHTML = "Connecting...";
  conn.on('open', () => {
    console.log("connected!");
    updateAllConnections(conn);
    // updateAllMembers();
    const displayId = document.getElementById("display-id");
    displayId.innerHTML = "ID: " + conn.peer;
    enterRoom('join');
    conn.send(["username", peerId, username])
  });
  conn.on('data', data => {
    // if (typeof(data) === "string") {
    //   sendMessage(conn, data);
    // } else if (Array.isArray(data)) {
    //   allMembers = data;
    // }
    switch (data[0]) {
      case "message": {
        displayMessage(conn.peer, data[1], data[2]);
        break;
      }
      case "members": {
        updateAllMembers(data[1]);
        console.log(allMembers);
      }
    }
  });
}

function enterRoom(action) {
  console.log(username);
  const messageBoardWidth = width/1.7;

  chooseUsername.style.display = "none";
  chatRoom.style.display = "flex";
  messageBoard.style.width = messageBoardWidth + "px;";
  messageBoard.style.height= height/1.4 + "px";

  inputMessage.addEventListener("keypress", e => {
    if (e.keyCode === 13 && inputMessage.value.length > 0) {
      sendMessage(peer, username, inputMessage.value);
      console.log(allConnections, allMembers);
    }
  });
  sendButton.addEventListener("click", e => {
    sendMessage(peer, username, inputMessage.value);
  })
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

function updateAllMembers(updated) {
  allMembers.length = 0;
  for (let m of updated) {
    allMembers.push(m);
  }
  updateMemberDisplay();
}

function updateMemberDisplay() {
  const displayMembers = document.getElementById("display-members");
  if (allMembers.length > 0) {
    let usernames = []
    for (let m of allMembers) {
      usernames.push(m[1]);
    }
    displayMembers.innerHTML = "Connected: " + usernames.join(", ");
  }
}

function addMember(id, username) {
  allMembers.push([id, username]);
}

function removeMembers(id, username) {

}

function sendMessage(senderId, senderName, msg) {
  for (let c of allConnections) {
    if (c && c.open) {
      if (c.peer != senderId) c.send(["message", senderName, msg]);
    }
  }
  displayMessage(senderId, senderName, msg);
  inputMessage.value = "";
}

function displayMessage(senderId, senderName, text) {
  const p = document.createElement("p");
  const node = document.createTextNode(senderName + ":  " + text);
  p.appendChild(node);
  messageBoard.appendChild(p);
  messageBoard.scrollTo(0, messageBoard.scrollHeight);
  allMessages.push({
    senderId: peer,
    username: senderName,
    message: text
  });
  console.log(allMessages);
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
