const width = window.innerWidth;
const height = window.innerHeight;

const title = document.getElementById("title");
const chatRoom = document.getElementById("chatroom");
const home = document.getElementById("home");
const displayId = document.getElementById("display-id");
const chooseUsername = document.getElementById("choose-username");
const messageBoard = document.getElementById("message-board");
const inputMessage = document.getElementById("input-message");
const sendButton = document.getElementById("send-message");
const leaveRoomButton = document.getElementById("leave-room");

const joinRoomField = document.getElementById("join-room-field");
joinRoomField.addEventListener("keypress", e => {
  if (e.keyCode === 13) {
    const value = joinRoomField.value;
    joinRoom();
  }
});
const joinMsg = document.getElementById("error-msg");

const colors = [
  // red: "rgb(255, 0, 0)", //red
  "rgb(0, 0, 255)", //blue
  "rgb(255,140,0)", //orange
  "rgb(238, 130, 238)", //pink
  "rgb(255, 165, 0)", //yellow
  "rgb(106, 90, 205)", //purple
  // green: "rgb(60, 179, 113)", //green
  "rgb(0, 255, 255)", //cyan
  "rgb(139,69,19)", //brown
  "rgb(220,20,60)", //crimson
];

const availableColors = [];
refillColors();

function refillColors() {
  availableColors.length = 0;
  for (let color of colors) {
    availableColors.push(color);
  }
}

let allConnections = [];
let allMembers = [];
let allMessages = [];
let peer = new Peer();
let peerId;
let roomId;
let username;
let myColor;
let isHost = false;
initializePeer();
enterUsername();

function enterUsername() {
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
        mainMenu();
      } else {
        alert("Username cannot be empty!");
      }
    }
  });
  const submitUsername = document.getElementById("submit-username");
  submitUsername.addEventListener("click", e => {
    if (usernameField.value.length > 0) {
      username = usernameField.value;
      mainMenu();
    } else {
      alert("Username cannot be empty!");
    }
  });
}

function mainMenu() {
  chooseUsername.style.display = "none";
  chatRoom.style.display = "none";
  home.style.display = "flex";
  title.style.display = "block";
  joinMsg.innerHTML = "";
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
  peer.on("disconnected", () => {
    leaveRoom();
  });
}

function createRoom() {
  isHost = true;
  myColor = availableColors.shift();
  console.log("room created");
  addMember(peerId, username, myColor);
  updateMemberDisplay();
  peer.on("connection", conn => {
    console.log("Received connection");
    updateAllConnections(conn);

    // updateAllMembers();
    // for (let c of allConnections) {
    //   // c.send(allConnections);
    //   c.send(allMembers);
    conn.on('close', () => {
      console.log("disconnected");
      const dcMember = getMemberById(conn.peer);
      //Add color of member who left back to the available colors
      insertIntoArray(availableColors, 0, dcMember[2]);
      removeMember(dcMember[0], dcMember[1]);
      for (let c of allConnections) {
        if (c && c.open) {
          if (c.peer === dcMember[0]) {
            console.log(allConnections);
            removeFromArray(allConnections, c);
            console.log(allConnections);
            continue;
          }
          c.send(['members', allMembers]);
        }
      }
      sendAnnouncement(dcMember[1] + " has left the room.", "rgb(255, 0, 0)");
      updateMemberDisplay();
    });

    conn.on('data', data => {
      switch (data[0]) {
        case "message": {
          sendMessage(conn.peer, data[1], data[2], data[3]);
          break;
        }
        // case "announcement": {
        //   sendAnnouncement(data[1], data[2]);
        //   break;
        // }
        case "username": {
          const userColor = availableColors.shift();
          addMember(data[1], data[2], userColor);
          for (let c of allConnections) {
            if (c && c.open) {
              c.send(['members', allMembers]);
            }
          }
          conn.send(['color', userColor]);
          sendAnnouncement(data[2] + " has joined the room.", "rgb(50,205,50)");
          updateMemberDisplay();
          break;
        }
        case "disconnect": {
          console.log("disconnected");
          console.log(data[1], data[2]);
          //Add color of member who left back to the available colors
          insertIntoArray(availableColors, 0, getMember(data[1], data[2])[2]);
          removeMember(data[1], data[2]);
          for (let c of allConnections) {
            if (c && c.open) {
              if (c.peer === data[1]) {
                console.log(allConnections);
                removeFromArray(allConnections, c);
                console.log(allConnections);
                continue;
              }
              c.send(['members', allMembers]);
            }
          }
          sendAnnouncement(data[2] + " has left the room.", "rgb(255, 0, 0)");
          updateMemberDisplay();
          break;
        }
      }
    });
  });
  enterRoom();
}

function joinRoom() {
  // TODO: Block connecting to people joining rooms
  // peer.on('connection', c => {
  //   c.on('open', () => {
  //     c.send("ID does not accept incoming connections");
  //     setTimeout(() => {
  //       c.close();
  //     }, 500);
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
    displayId.innerHTML = "ID: " + conn.peer;
    conn.send(["username", peerId, username]);
    roomId = id;
    enterRoom();
  });
  // conn.on('close', () => {
  //   alert("The host has ended the room. You have been returned to the home screen.");
  //   leaveRoom();
  // })
  conn.on('data', data => {
    switch (data[0]) {
      case "message": {
        displayMessage(conn.peer, data[1], data[2], data[3]);
        break;
      }
      case "announcement": {
        displayAnnouncement(data[1], data[2])
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
      case "disconnect": {
        alert("The host has ended the room. You have been returned to the home screen.");
        leaveRoom();
      }
    }
  });
}

function enterRoom() {
  const messageBoardWidth = width/1.7;

  title.style.display = "none";
  home.style.display = "none";
  chatRoom.style.display = "flex";
  messageBoard.style.width = messageBoardWidth + "px";
  messageBoard.style.height= height/1.4 + "px";
  messageBoard.style.maxWidth = messageBoardWidth + "px";
  console.log(messageBoard.style.width, messageBoard.style.maxWidth);
  const messageBoardCoords = messageBoard.getBoundingClientRect();
  leaveRoomButton.style.top = (messageBoardCoords.top - 45) + "px";
  leaveRoomButton.style.left = messageBoardCoords.left + "px";

  inputMessage.addEventListener("keypress", e => {
    if (e.keyCode === 13 && inputMessage.value.length > 0) {
      sendMessage(peer, username, inputMessage.value, myColor);
      inputMessage.value = "";
    }
  });
  sendButton.addEventListener("click", e => {
    if (inputMessage.value.length > 0) {
      sendMessage(peer, username, inputMessage.value, myColor);
      inputMessage.value = "";
    }
  })
}

function leaveRoom() {
  if (!isHost) {
    for (let c of allConnections) {
      c.send(["disconnect", peerId, username]);
      break;
    }
    messageBoard.innerHTML = "";
    allConnections.length = 0;
    allMembers.length = 0;
    mainMenu();
  } else {
    for (let c of allConnections) {
      c.send(["disconnect"]);
      break;
    }
    peer = new Peer();
    initializePeer();
    refillColors();
    messageBoard.innerHTML = "";
    allConnections.length = 0;
    allMembers.length = 0;
    mainMenu();
  }
}

function updateAllConnections(conn) {
  // if (!allConnections.includes(conn)) {
  //   allConnections.push(conn);
  // }
  // for (let c of allConnections) {
  //   if (c.peer === conn.peer) {
  //     return;
  //   }
  // }
  allConnections.push(conn);
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

function addMember(id, username, color) {
  allMembers.push([id, username, color]);
}

function removeMember(id, name) {
  for (let member of allMembers) {
    if (member[0] === id && member[1] === name) {
      removeFromArray(allMembers, member);
      break;
    }
  }
}

function getMember(id, name) {
  for (let member of allMembers) {
    if (member[0] === id && member[1] === name) {
      return member;
    }
  }
}

function getMemberById(id) {
  for (let member of allMembers) {
    if (member[0] === id) {
      return member;
    }
  }
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
  p.innerHTML = "<span style='color: gray'>" + createTimeStamp() + "  -  </span><span style='color: " + senderColor + "';>" + senderName + ":  </span>" + text;
  messageBoard.scrollTo(0, messageBoard.scrollHeight);
  allMessages.push({
    senderId: peer,
    username: senderName,
    message: text
  });
}

function sendAnnouncement(text, color) {
  for (let c of allConnections) {
    if (c && c.open) {
      c.send(["announcement", text, color]);
    }
  }
  displayAnnouncement(text, color);
}

function displayAnnouncement(text, color) {
  const p = document.createElement("p");
  messageBoard.appendChild(p);
  p.style.color = color;
  //<span style='color: gray'>" + createTimeStamp() + "    </span>
  p.innerHTML = "<span style='color: " + color + "';>" + "-- " + text + " --" + "</span>";
  messageBoard.scrollTo(0, messageBoard.scrollHeight);
  allMessages.push({
    senderId: "server message",
    username: "server message",
    message: text
  });
}

function createTimeStamp() {
  const time = new Date();
  let timeStamp;
  let hours;
  let minutes;
  let period;
  if (time.getMinutes() < 10) {
    minutes = "0" + time.getMinutes();
  } else {
    minutes = time.getMinutes();
  }
  let currentHour = time.getHours();
  if (currentHour < 13) {
    period = "AM";
    if (currentHour < 10) {
      if (currentHour === 0) {
        currentHour = 12;
        hours = currentHour
      } else {
        hours = "0" + currentHour;
      }
    } else {
      hours = currentHour;
    }
  } else {
    period = "PM";
    hours = currentHour - 12;
    if (hours < 10) {
      hours = "0" + hours;
    }
  }
  timeStamp = hours + ":" + minutes + " " + period;
  return timeStamp;
}

function removeFromArray(arr, element) {
  arr.splice(arr.indexOf(element), 1);
}

function insertIntoArray(arr, index, element) {
  arr.splice(index, 0, element);
}

window.addEventListener("resize", () => {
  const messageBoardCoords = messageBoard.getBoundingClientRect();
  leaveRoomButton.style.top = (messageBoardCoords.top - 45) + "px";
  leaveRoomButton.style.left = messageBoardCoords.left + "px";
});

window.addEventListener("unload", () => {
  leaveRoom();
});
