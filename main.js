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
    enterUsername();
  }
});
const joinMsg = document.getElementById("error-msg");

const colors = {
  red: "rgb(255, 0, 0)",
  blue: "rgb(0, 0, 255)",
  green: "rgb(60, 179, 113)",
  pink: "rgb(238, 130, 238)",
  yellow: "rgb(255, 165, 0)",
  purple: "rgb(106, 90, 205)",
  cyan: "rgb(0, 255, 255)",
  orange: "rgb(255,140,0)",
  brown: "rgb(139,69,19)",
  crimson: "rgb(220,20,60)"
};

const availableColors = [];
refillColors();

function refillColors() {
  if (availableColors.length === 0) {
    for (let color in colors) {
      availableColors.push(colors[color]);
    }
  }
}

let allConnections = [];
let allMembers = [];
let allMessages = [];
const peer = new Peer();
let peerId;
let username;
let myColor;
let isHost = false;
initializePeer();

function enterUsername(action) {
  chooseUsername.style.display = "flex";
  home.style.display = "none";
  const usernameField = document.getElementById("username-field");
  usernameField.addEventListener("keypress", e => {
    if (usernameField.value.length > 15 && e.keyCode !== 13) {
      usernameField.value.length = 15;
    }
    if (e.keyCode === 13) {
      if (usernameField.value.length > 0) {
        username = usernameField.value;
        if (action === "create") {
          createRoom();
        } else {
          joinRoom();
        }
      } else {
        alert("Username cannot be empty!");
      }
    }
  });
  const submitUsername = document.getElementById("submit-username");
  submitUsername.addEventListener("click", e => {
    if (usernameField.value.length > 0) {
      username = usernameField.value;
      if (action === "create") {
        createRoom();
      } else {
        joinRoom();
      }
    } else {
      alert("Username cannot be empty!");
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
  myColor = availableColors.shift();
  console.log("room created");
  addMember(peerId, username);
  updateMemberDisplay();
  peer.on("connection", conn => {
    console.log("Received connection");
    updateAllConnections(conn);
    console.log(allConnections);
    // updateAllMembers();
    // for (let c of allConnections) {
    //   // c.send(allConnections);
    //   c.send(allMembers);
    conn.on('data', data => {
      switch (data[0]) {
        case "message": {
          sendMessage(conn.peer, data[1], data[2], data[3]);
          break;
        }
        case "username": {
          addMember(data[1], data[2]);
          for (let c of allConnections) {
            if (c && c.open) {
              console.log(availableColors);
              c.send(['members', allMembers]);
            }
          }
          conn.send(['color', availableColors.shift()]);
          updateMemberDisplay();
          break;
        }
      }
    });
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
    conn.send(["username", peerId, username]);
  });
  conn.on('data', data => {
    switch (data[0]) {
      case "message": {
        displayMessage(conn.peer, data[1], data[2], data[3]);
        break;
      }
      case "members": {
        updateAllMembers(data[1]);
        console.log(allMembers);
        break;
      }
      case "color": {
        myColor = data[1];
        break;
      }
    }
  });
}

function enterRoom(action) {
  const messageBoardWidth = width/1.7;

  chooseUsername.style.display = "none";
  chatRoom.style.display = "flex";
  messageBoard.style.width = messageBoardWidth + "px;";
  messageBoard.style.height= height/1.4 + "px";

  inputMessage.addEventListener("keypress", e => {
    if (e.keyCode === 13 && inputMessage.value.length > 0) {
      sendMessage(peer, username, inputMessage.value, myColor);
      inputMessage.value = "";
      console.log(allConnections, allMembers);
    }
  });
  sendButton.addEventListener("click", e => {
    if (inputMessage.value.length > 0) {
      sendMessage(peer, username, inputMessage.value, myColor);
    }
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

// function updateAvailableColors(update) {
//   availableColors.length = 0;
//   for (let color of update) {
//     availableColors.push(color);
//   }
// }

function sendMessage(senderId, senderName, msg, senderColor) {
  console.log(senderColor);
  for (let c of allConnections) {
    if (c && c.open) {
      if (c.peer != senderId) c.send(["message", senderName, msg, senderColor]);
    }
  }
  displayMessage(senderId, senderName, msg, senderColor);
  if (senderId === peerId) {
    inputMessage.value = "";
  }
}

function displayMessage(senderId, senderName, text, senderColor) {
  const p = document.createElement("p");
  // const node = document.createTextNode("<span style= 'color: " + myColor + "';>" +  senderName + ":  </span>" + text);
  // p.appendChild(node);
  messageBoard.appendChild(p);
  p.innerHTML = "<span style= 'color: " + senderColor + "';>" +  senderName + ":  </span>" + text;
  messageBoard.scrollTo(0, messageBoard.scrollHeight);
  allMessages.push({
    senderId: peer,
    username: senderName,
    message: text
  });
  console.log(allMessages);
}

function removeFromArray(arr, element) {
  arr.splice(arr.indexOf(element), 1);
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
