function enterRoom() {
  window.open("room/room.html", "_self");
}

function inputInfo(action) {
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

idField.addEventListener('keypress', e => {
  if (e.keyCode === 13) {
    inputName();
  }
});

nameField.addEventListener('keypress', e => {
  if (e.keyCode === 13) {
    enterRoom();
  }
})
