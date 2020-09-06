let action;

function inputInfo(action) {
  action = action;
  const buttons = document.getElementsByClassName("room");
  for (let button of buttons) {
    button.style.display = "none";
  }
  const inputInfo = document.getElementsByClassName("inputInfo")[0];
  inputInfo.style.display = "flex";
  if (action === "create") {
    inputName();
  }
}

const idField = document.getElementsByClassName("inputId")[0];
const nameField = document.getElementsByClassName("inputName")[0];

function inputName() {
  idField.style.display = "none";
  nameField.style.display = "flex";
}

function validateId(id) {
  const peer = new Peer();
  peer.on('connection', conn => {
    enterRoom();
    return;
  });
  const p = document.getElementById("connecting");
  p.style = "text-align: center";
  p.innerHTML = "Connecting...";
  idField.appendChild(p);
  setTimeout(() => {
    p.style = "text-align: center; color: red";
    p.innerHTML = "Unable to establish connection, please check that your ID is correct."
  }, 3000);
}

function enterRoom() {
  window.open("room/room.html", "_self");
}

idField.addEventListener('keypress', e => {
  if (e.keyCode === 13) {
    validateId(idField.value);
  }
});

nameField.addEventListener('keypress', e => {
  if (e.keyCode === 13) {
    enterRoom();
  }
})
