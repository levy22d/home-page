//referenced https://github.com/5ebs/book-keeper/blob/master/script.js for help on bookmarks portion

const newBookmark = document.querySelector(".new-bookmark");
const modal  = document.querySelector(".modal-container");
const close = document.querySelector(".close");
const bookmarkContainer = document.querySelector('.bookmark-container');
const modalForm = document.forms['modal-form'];
const error = document.querySelector(".error");
const welcomeMsg = document.querySelector('.welcome-message');
const time = document.querySelector('.time');
let wName = localStorage.getItem('welcome-name') ? localStorage.getItem('welcome-name') : '';

let r;
let g;
let b;

/**
* Sets background to pastel (but not too light!) colors.
**/
function setBackground(){
  const MAX = 240;
  const MIN = 170;

  r = Math.floor(Math.random() * (MAX - MIN)) + MIN;
  g = Math.floor(Math.random() * (MAX - MIN)) + MIN;
  b = Math.floor(Math.random() * (MAX - MIN)) + MIN;

  document.body.style.background = `rgb(${r},${g},${b})`;
  time.style.color = `rgb(${r - 110},${g - 110},${b - 110})`;
}

/**
* Shows "good morning", "good afternoon", etc. depending on the time of day.
* Also displays the input for the name and calls the function to set the name.
**/
function showWelcome(){
  const hour = new Date().getHours();
  if(hour >= 5 && hour < 12){
    welcomeMsg.textContent = "Good morning, ";
  } else if(hour > 12 && hour < 17){
    welcomeMsg.textContent = "Good afternoon, ";
  } else if(hour >= 17 && hour <= 21){
    welcomeMsg.textContent = "Good evening, ";
  } else {
    welcomeMsg.textContent = "Hello, ";
  }

  if(!wName){
    const insertName = document.createElement('input');
    insertName.type = "text";
    insertName.classList.add('welcome-insert-name');
    insertName.maxLength = "18";
    welcomeMsg.append(insertName);
    insertName.addEventListener('keyup', (e) => e.key === 'Enter' && insertName.value ? setName(insertName.value, welcomeMsg, insertName) : null);
  } else{
    setName(wName, welcomeMsg, null);
  }
}

/**
* Sets the name on the welcome part of the screen when the enter key is pressed
* in the input. Also allows for editing and saves it to localStorage.
**/
function setName(newName, message, inputElement){
  if(!wName){
    wName = newName;
    saveNameToStorage(wName);
    inputElement.remove();
  }

  message.textContent += wName + ".";
  const editButton = document.createElement('i');
  editButton.classList.add('fas', 'fa-pencil-alt', 'welcome-edit');
  editButton.alt = "edit";
  editButton.tabIndex = "0";

  message.append(editButton);
  editButton.addEventListener('click', () => {
    wName = '';
    removeNameFromStorage();
    showWelcome();
  });

  editButton.addEventListener('keyup', (e) =>{
    if(e.key === "Enter"){
      wName = '';
      removeNameFromStorage();
      showWelcome();
    }
  })
}

/**
* Sets and changes the time every minute.
**/
function setTime(){
  const date = new Date();
  let hour = date.getHours();
  let min = date.getMinutes();
  let amPm = hour >= 12 ? "pm" : "am";

  hour = normalizeHour(hour);
  min < 10 ? min = "0" + min : min;

  time.textContent = `${hour}:${min} ${amPm}`;


  setTimeout(setTime, 60000);
}

/**
* Helper function for AM/PM.
**/
function normalizeHour(hour){
  (hour > 12) ? hour -= 12 : hour;
  hour === 0 ? hour = 12 : hour;

  return hour;
}

/**
* Gets the current date in a readable way.
**/
function showDate(){
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const date = new Date();
  const dateText = document.querySelector('.date');
  dateText.textContent = days[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate();
}

/**
* Adds a bookmark.
**/
function addBookmark(e){
  e.preventDefault();
  const name = modalForm['bookmark-name'].value;
  const url = modalForm['bookmark-URL'].value;

  if(validate(name, url)){
    createBookmark(name, url);

    modalForm['bookmark-name'].value = '';
    modalForm['bookmark-URL'].value = '';

    modal.style.display = 'none';
    error.textContent = '';
    error.style.display = 'none';

    saveBookmarkToStorage(name, url);
  }
}

/**
* Creates the HTML for the bookmark.
**/
function createBookmark(name, url){
  //creating the elements
  const newBookmark = document.createElement('div');
  const newBookmarkURL = document.createElement('a');
  const closeBookmark = document.createElement('i');
  const bookmarkImage = document.createElement('img');

  //adding classes
  newBookmark.classList.add("bookmark");
  newBookmarkURL.classList.add("bookmark-url");
  closeBookmark.classList.add('fas', 'fa-times', 'close-bookmark');
  bookmarkImage.classList.add('bookmark-img');

  //adding attributes
  bookmarkImage.src = `https://s2.googleusercontent.com/s2/favicons?domain=${url}`;
  bookmarkImage.alt = "Bookmark icon";

  closeBookmark.alt = "close";
  closeBookmark.tabIndex = "0";

  newBookmarkURL.href = url;
  newBookmarkURL.target = "_blank";
  newBookmarkURL.textContent = name;
  setHoverColor(newBookmarkURL);

  //adding events
  closeBookmark.addEventListener('click', () => removeBookmark(newBookmark));
  closeBookmark.addEventListener('keyup', (e) => e.key === "Enter" ? removeBookmark(newBookmark) : null);

  //putting it on the screen
  newBookmark.append(newBookmarkURL);
  newBookmark.append(closeBookmark);
  newBookmark.append(bookmarkImage);
  bookmarkContainer.append(newBookmark);
}

/**
* Checks if the bookmark url is valid and if the fields are filled in.
* Helper function.
**/
function validate(name, url){
  if(!name || !url){
    error.style.display = 'block';
    error.textContent = "Make sure all fields are filled in.";
    return false;
  }

    try {
      new URL(url);
    } catch (err){
      error.style.display = 'block';
      error.textContent = "Please enter a valid URL.";
      return false;
    }

    if(localStorage.getItem("bookmark-" + url)){
      //URLs need to be unique so they can be used as keys in localStorage
      error.style.display = 'block';
      error.textContent = "Please enter a unique URL.";
      return false;
    }

    return true;
}

/**
* Removes a bookmark when the X is pressed.
**/
function removeBookmark(bookmark){
  bookmark.remove();
  removeBookmarkFromStorage(bookmark.firstChild.href);
}

/**
* For dynamic styling with the changing backgrounds, sets background hover
* of an element to a color slightly darker than the page background.
**/
function setHoverBackground(element){
  const DEC = 110;

  const bgColor = element.style.background;

  element.addEventListener('mouseenter', () => element.style.background = `rgb(${r - DEC},${g - DEC},${b - DEC})`);
  element.addEventListener('mouseleave', () => element.style.background = bgColor);
}

/**
* For dynamic styling with the changing backgrounds, sets color hover
* of an element to a color slightly darker than the page background.
**/
function setHoverColor(element){
  const DEC = 110;

  const color = element.style.color;

  element.addEventListener('mouseenter', () => element.style.color = `rgb(${r - DEC},${g - DEC},${b - DEC})`);
  element.addEventListener('mouseleave', () => element.style.color = color);
}



/** Saving and removing to and from localStorage **/
function saveBookmarkToStorage(name, url){
  localStorage.setItem("bookmark-" + url, name);
}

function removeBookmarkFromStorage(url){
  if(localStorage.getItem("bookmark-" + url)){
    localStorage.removeItem("bookmark-" + url);
  }
}

function saveNameToStorage(name){
  if(name){
    localStorage.setItem("welcome-name", name);
  }
}

function removeNameFromStorage(){
  if(localStorage.getItem('welcome-name')){
    localStorage.removeItem('welcome-name');
  }
}

/* Loads from localStorage */
function loadBookmarks(){
  for(let i = 0; i < localStorage.length; i++){
    if(!localStorage.key(i).startsWith("bookmark-")){
      continue;
    }
    const name = localStorage.getItem(localStorage.key(i));
    const url = localStorage.key(i).slice(9); //get rid of "bookmark-"
    createBookmark(name, url);
  }
}

/* To be called on start */
error.style.display = 'none';
showDate();
showWelcome();
setTime();
setBackground();
setHoverBackground(newBookmark);
loadBookmarks();

/* Event Listeners */
newBookmark.addEventListener('click', () => modal.style.display = "block");
close.addEventListener('click', () => modal.style.display = 'none');
close.addEventListener('keyup', (e) => e.key === 'Enter' ? modal.style.display = 'none' : null);
modalForm.addEventListener('submit', addBookmark);
