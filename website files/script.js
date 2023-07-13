// populates the temp paragraph with data by fetching the json data

async function populateStorageText(){
  var allBookPath = "allBookShelved.json";
  var uidsPath = "uidPerBook.json";
  const books = await fetch(allBookPath);
  const booksJSON = await books.json();
  const uids = await fetch(uidsPath);
  const uidsJSON = await uids.json();
  useAllBooks(uidsJSON, booksJSON);
}

//finds the book with the specified uid
function findUID(uid, uidsPerBook){
  for(book of uidsPerBook){
    if(book["uid"] == uid){
      return book;
    }
  }
  return null;
}

//writes into the temp paragraph with the current books shelved
function useAllBooks(uidsPerBook, allBooksShelved){
  var tempText = "";
  var shelfNum = 0;
  for(shelf of allBooksShelved){
    var bookNum = 0;
    for(book of shelf["books"]){
      var findingBook = findUID(book["uid"], uidsPerBook);
      if(findingBook != null){
        tempText += findingBook["title"] + "," + findingBook["author"] + "," + findingBook["genre"] + "," + findingBook["uid"] + "," + (shelfNum + 1) + "," + (bookNum + 1) + ";";
      } else{
        tempText += "empty,,,ffff," + shelfNum + "," + bookNum + ";";
      }
      bookNum++;
    }
    shelfNum++;
  }

  tempText = tempText.substring(0, tempText.length - 1);
  document.getElementById("temporary-p").innerHTML = tempText;
}

//finds bookPos from the index in allBooks
function bookFindPos(allBookNum){
  var bookPos = [-1, -1];

  bookPos[0] = Math.floor(allBookNum / 6);

  bookPos[1] = allBookNum % 6;

  return bookPos;
}

//finds index of the book in allBooks from the bookPos
function posFindBook(bookPos){
  var bookNum = -1;

  bookNum = (bookPos[0]*6) + bookPos[1];

  return bookNum;
}

//finds optimal spot for the specified book's position
function findOptimalSpotForBook(shelf, posOnShelf) {
  var optimalSpot = [-1, -1]; // shelf, posOnShelf

  var bookIndex = posFindBook([shelf, posOnShelf])
  for (author of optimalAuthorLayout) {
    if (author === allBooks[bookIndex][1]) {
      var optimalIndex = optimalAuthorLayout.indexOf(author);
      var optimalSpot = bookFindPos(optimalIndex);
      if(author >= allBooks[optimalIndex][1]){
        optimalIndex += 1;
        if(optimalIndex > 17){optimalIndex = 17;}
      }
      optimalSpot[0] += 1;
      optimalSpot[1] += 1;
      return optimalSpot;
    }
  }

  return optimalSpot;
}

//creates an optimal layout for the books based on alphabetical sorting of authors
function createOptimalLayout() {
  var listOfAuthors = [];

  for (book of allBooks) {
    if(book[1] != ""){
      listOfAuthors.push(book[1]);
    }
  }
  listOfAuthors.sort();

  for(var i = listOfAuthors.length; i < 18; i++){
    listOfAuthors.push("");
  }
  
  return listOfAuthors;
}

//checks to see if all books are in the right location
function areBooksInRightPlace() {
  for (var i = 0; i < listOfBooks.length; i++) {
    if(allBooks[i][3] == "ffff"){
      listOfBooks[i].classList.remove("red");
      listOfBooks[i].classList.remove("green");
      continue;
    }
    if (!checkBasedOnOthers(i - 1, i, i + 1, allBooks)) {
      listOfBooks[i].classList.add("red");
      listOfBooks[i].classList.remove("green");
    }
  }
}

// checks to see if the book is in the right place compared to the book before it or after it
function checkBasedOnOthers(preBookIndex, curBookIndex, postBookIndex, books) {
  var preBook;
  var curBook;
  var postBook;
  //-1 = left, 0 = middle, 1 = right
  var edgeCase = 0;
  preBook = books[preBookIndex];
  curBook = books[curBookIndex];
  postBook = books[postBookIndex];

  if (preBookIndex > 0 && postBookIndex < 17) {
    edgeCase = 0;
  } else if (preBookIndex < 0) {
    edgeCase = -1;
  } else if(postBookIndex > 17){
    edgeCase = 1;
  }

  if (edgeCase == 0) {
    if (preBook[1].toLowerCase().localeCompare(curBook[1].toLowerCase()) <= 0) {
      if (curBook[1].toLowerCase().localeCompare(postBook[1].toLowerCase()) <= 0) {
        return true;
      }
    }
  } else if (edgeCase == -1) {
    if(postBook[1] == ""){
      return true;
    }
    if (curBook[1].toLowerCase().localeCompare(postBook[1].toLowerCase()) <= 0) {
      return true;
    }
  } else if (edgeCase == 1){
    if(preBook[1] == ""){
      return true;
    }
    if (preBook[1].toLowerCase().localeCompare(curBook[1].toLowerCase()) <= 0) {
      return true;
    }
  }
  if(optimalAuthorLayout[curBookIndex].toLowerCase() == curBook[1].toLowerCase()){
    return true;
  }

  return false;
}

// populates recommended movements based on what is marked as misplaced
function populateRecommendedMovements(){
  let isMess = false;
  for(var i = 0; i < listOfBooks.length; i++){
    for(clas of listOfBooks[i].classList){
      if(clas == "red"){
        var currentPos = bookFindPos(i);
        var optimalSpot = findOptimalSpotForBook(currentPos[0], currentPos[1]);
        element("sectionForMovements").innerHTML += `<br>&#8227; Move book ${currentPos[1] + 1} from shelf 
        ${currentPos[0] + 1} to spot ${optimalSpot[1]} on shelf ${optimalSpot[0]}.
        (${currentPos[0] + 1}, ${currentPos[1] + 1})&rarr;(${optimalSpot[0]},${optimalSpot[1]})`;
        isMess=true;
      }
    }
  }
  if(isMess){document.querySelector(".messWarning").classList.remove("hidden")}else{document.querySelector(".messWarning").classList.add("hidden")}
}
function showOrder(){
  document.getElementById('sectionForMovements').classList.toggle("hidden");
}
//global variables and start functions
var listOfShelvs = document.querySelectorAll(".bookStack");
var listOfBooks = document.querySelectorAll(".booksClass");
var books = [];
var allBooks = [];
var optimalAuthorLayout = [];
populateStorageText().then(() => {
  var storage_text = document.getElementById("temporary-p").innerHTML;
  books = storage_text.split(";");
  books.forEach((element) => {
    var eachBook = element.split(",");
    eachBook[0] = eachBook[0].trim();
    allBooks.push(eachBook);
  });
  optimalAuthorLayout = createOptimalLayout();
  console.log("Optimal Author Layout: " + optimalAuthorLayout);
  areBooksInRightPlace();
  for (var i = 0; i < allBooks.length; i++) {
    listOfBooks[i].textContent = allBooks[i][0];
    if(allBooks[i][0] != ""){
      console.log(allBooks[i][0]);
      listOfBooks[i].classList.add("" + allBooks[i][0].replace(/ /g, "") + "");
    }
  }
  populateRecommendedMovements();
  
});
for(bok of listOfBooks){
  if(bok.style.overflow){
    console.log("nice");
  }else{
    console.log(bok.style.overflow);
  }
}
//shortened element function
function element(id) {
  // to shorten getElement function
  return document.getElementById(id);
}

//updates the shelf colors based on the colors of the books
// function updateShelfColor(i) {
//   const booksInShelf = document.querySelectorAll(`.shelf${i + 1}`);

//   for (const b of booksInShelf) {
//     const classes = b.classList;

//     for (const c of classes) {
//       if (c == "red") {
//         return ["red", i + 1];
//       }
//     }
//   }
// }

//displays buttons for each searched book
function search() {
  document.getElementById("search-data").classList.remove("hidden");
  var searched = document.getElementById("search-input").value;
  var booksToShow = findSearchedBooks(allBooks, searched);
  showBooks(booksToShow);
}

//creates buttons for books to be displayed
function showBooks(books) {
  var allSearchData = "";

  for (let book of books){
    if(book[0] != "" && book[0] != "empty"){
      var bookElement = document.querySelector(`.${book[0].replace(/ /g, "")}`);
      console.log(bookElement);
      console.log(book);
      var shelf = parseInt(book[4]);
      var posOnShelf = parseInt(book[5]);
      var isBookInP = "";
      var colorBookIn = "";
      console.log(shelf + " , " + posOnShelf);
      for (clas of bookElement.classList) {
        console.log(clas);
        if (clas == "red") {
          isBookInP = "book is misplaced";
          colorBookIn = "redSearch";
        }
      }
      allSearchData +=
        "<div class='bookButtonsDiv'>" +
        "<button class ='searchBook' onclick='loadInfo(" +
        (shelf - 1)+
        `,` +
        (posOnShelf - 1) +
        ")'>" +
        book[0] +
        ` by: ` +
        book[1] +
        // "<br>" +
        // `genre:` +
        // book[2] +
        "<br>" +
        // "<img src=" +
        // `'pictures\\${book[0]} pic.jpg'` +
        // " alt='' class='bookImage'>" +
        `<div id="isBookCor" class=${colorBookIn}> ${isBookInP}</div>` +
        "</button>" +
        "</div>";
    }
  }

  element("search-data").innerHTML = allSearchData;
}

//checks the search entry against allBooks
function findSearchedBooks(books, searched) {
  var booksToShow = [];

  if (searched.length <= 0) {
    booksToShow = books;
    return booksToShow;
  } else {
    let counter = 0; // counts to 10

    for (let book of books) {
      var toSearch = book[0] + "," + book[1] + "," + book[2];

      if (counter < 10) {
        //checks for similarities
        if (toSearch.toLowerCase().includes(searched.toLowerCase())) {
          booksToShow.push(book);
        }
      }
    }
  }

  return booksToShow;
}

element("search-input").oninput = function () {
  search();
};

// loads the shelf with each book on it
function loadShelf(shelfNum) {
  for (const stack of listOfShelvs) {
    stack.classList.add("hidden");
  }

  var buttons = document.querySelectorAll(`.shelf${shelfNum + 1}`);

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle("hidden");
  }

  document.getElementById("returnButton").classList.remove("hidden");
  document.getElementById("classMapTitle").textContent =
    "Shelf " + (shelfNum + 1);
}

//unloads the current shelf
function unloadShelf() {
  const boks = document.querySelectorAll(".booksClass");

  for (b of boks) {
    b.classList.add("hidden");
  }

  for (const stack of listOfShelvs) {
    stack.classList.remove("hidden");
  }

  document.getElementById("classMapTitle").textContent = "Map of shelves";
  document.getElementById("returnButton").classList.add("hidden");
}

//displays the info of the selected book and goes to that book on the map
function loadInfo(shelf, posOnShelf) {
  window.scrollTo(0, 0);
  console.log(shelf + " , " + posOnShelf);
  let bookNum = posFindBook([shelf, posOnShelf]);
  console.log(bookNum);
  let bookInPlace = false;
  const xButton = document.getElementById("xButton");
  const book = allBooks[bookNum];
  console.log(book);
  if(book[1] != "" && book[0] != "empty"){
    const displayB = document.getElementById("bookInfo");
    let message = "";
    const everything = document.querySelectorAll(" body *");
    const image =
      "<img src=" +
      `'pictures\\${book[0]} pic.jpg'` +
      " alt='' class='bookImageInf'>";
    for (var thing of everything) {
      if (thing != displayB) {
        if (thing != document.getElementById("bookInfoGen")) {
          if (thing != xButton){
            if(thing != document.getElementById("search-data")){
              if(thing != document.getElementById("container-out")){ 
                thing.classList.add("blur");
              }
            }
          }
        }
      }
    }

    displayB.classList.remove("hidden");
    xButton.classList.remove("hidden");

    for (clas of listOfBooks[bookNum].classList) {
      if (clas == "red") {
        bookInPlace = true;
      }
    }

    if (bookInPlace) {
      console.log(shelf + ", " + posOnShelf);
      var optimalSpot = findOptimalSpotForBook(shelf, posOnShelf);
      message = `Recomended location: Shelf <b>${optimalSpot[0]}</b> at spot <b>${optimalSpot[1]}</b> from the left.`;
    }
    displayB.innerHTML =
      `<b>Title:</b> ${book[0]}\n<b>Author:</b> ${book[1]} \n<b>Genre:</b> ${book[2]} \n <br>This is book <b>${parseInt(book[5])}</b> on shelf <b>${parseInt(book[4])}</b>\n${message}` +
      image;
    console.log(image);
    //display selected shelf when clicked through search or through map
    // unloadShelf();
    // loadShelf(shelf);
    if(book[0] == ""){
      closeInfo();
    }
  }
}

//closes the info on the currently selected book
function closeInfo() {
  document.getElementById("bookInfo").classList.add("hidden");
  document.getElementById("xButton").classList.add("hidden");
  const everything = document.querySelectorAll(" body *");

  for (var thing of everything) {
    thing.classList.remove("blur");
  }
}
