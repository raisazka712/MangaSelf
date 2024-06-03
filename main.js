document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    let editedMangaId = null;
    let mangaIdToRemove = null;
    let searchQuery = '';

    submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (editedMangaId) {
            updateManga(editedMangaId);
        } else {
            addManga();
        }
        editedMangaId = null;
        submitForm.reset(); 
    });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      searchQuery = document.getElementById('searchBookTitle').value.toLowerCase();
      document.dispatchEvent(new Event(RENDER_EVENT));
  });

  function addManga() {
    const titleManga = document.getElementById('inputBookTitle').value;
    const authorManga = document.getElementById('inputBookAuthor').value;
    const yearManga = parseInt(document.getElementById('inputBookYear').value);
    const isComplete = document.getElementById('inputBookIsComplete').checked;
   
    const generatedID = generateId();
    const mangaObject = generateMangaObject(generatedID, titleManga, authorManga, yearManga, isComplete, false);
    mangas.push(mangaObject);
   
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function generateId() {
    return +new Date();
  }

  function generateMangaObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete
    }
  }

  const mangas = [];
  const RENDER_EVENT = 'render-mangas';

  document.addEventListener(RENDER_EVENT, function () {
    console.log(mangas);
  });

  function makeManga(mangaObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = mangaObject.title;
   
    const textAuthor = document.createElement('p');
    textAuthor.innerText= 'Author : ' + mangaObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Year : ' + mangaObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('action');
   
    const container = document.createElement('article');
    container.classList.add('book_item', 'shadow');
    container.append(textTitle, textAuthor, textYear, textContainer);
    container.setAttribute('id', `manga-${mangaObject.id}`);


    if (mangaObject.isComplete) {
        const buttonEdit = document.createElement('button');
        const buttonUnfinished= document.createElement('button');
        const buttonRemove= document.createElement('button');

        buttonEdit.classList.add('blue');
        buttonUnfinished.classList.add('green');
        buttonRemove.classList.add('red');

        buttonEdit.innerText='Edit';
        buttonUnfinished.innerText='Unfinished';
        buttonRemove.innerText='Remove';
        
        buttonEdit.addEventListener('click', function () {
            editManga(mangaObject.id);
        });
        buttonUnfinished.addEventListener('click', function () {
          undoMangaFromCompleted(mangaObject.id);
        });
        buttonRemove.addEventListener('click', function () {
          showDialog(mangaObject.id);
        });;
     
        textContainer.append(buttonEdit, buttonUnfinished, buttonRemove );
      } else {
        const buttonEdit = document.createElement('button');
        const buttonFinish= document.createElement('button');
        const buttonRemove= document.createElement('button');

        buttonEdit.classList.add('blue');
        buttonFinish.classList.add('green');
        buttonRemove.classList.add('red');

        buttonEdit.innerText='Edit';
        buttonFinish.innerText='Finish';
        buttonRemove.innerText='Remove';

        buttonEdit.addEventListener('click', function () {
            editManga(mangaObject.id);
        });
        buttonFinish.addEventListener('click', function () {
          addMangaToCompleted(mangaObject.id);
        });
        buttonRemove.addEventListener('click', function () {
          showDialog(mangaObject.id);
      });
        
        textContainer.append(buttonEdit, buttonFinish, buttonRemove );
      }

    return container
  }

  function addMangaToCompleted (mangaId) {
    const mangaTarget = findManga(mangaId);
   
    if (mangaTarget == null) return;
   
    mangaTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findManga(mangaId) {
    for (const mangaItem of mangas) {
      if (mangaItem.id === mangaId) {
        return mangaItem;
      }
    }
    return null;
  }

  document.addEventListener(RENDER_EVENT, function () {
    const uncompletedMANGAList = document.getElementById('uncompletedMangaList');
    uncompletedMANGAList.innerHTML = '';
   
    const completedMangaList = document.getElementById('completedMangaList');
    completedMangaList.innerHTML = '';

    for (const mangaItem of mangas) {
      const mangaElement = makeManga(mangaItem);
      if (!mangaItem.isComplete && mangaItem.title.toLowerCase().includes(searchQuery)) {
        uncompletedMANGAList.append(mangaElement);
      } else if (mangaItem.isComplete && mangaItem.title.toLowerCase().includes(searchQuery)) {
        completedMangaList.append(mangaElement);
      }
    }
  });


  function editManga(mangaId) {
    const mangaTarget = findManga(mangaId);
    if (!mangaTarget) return;

    document.getElementById('inputBookTitle').value = mangaTarget.title;
    document.getElementById('inputBookAuthor').value = mangaTarget.author;
    document.getElementById('inputBookYear').value = mangaTarget.year;
    editedMangaId = mangaTarget.id;
    saveData();
}

function updateManga(mangaId) {
    const titleManga = document.getElementById('inputBookTitle').value;
    const authorManga = document.getElementById('inputBookAuthor').value;
    const yearManga = parseInt(document.getElementById('inputBookYear').value);

    const mangaTarget = findManga(mangaId);
    if (mangaTarget) {
        mangaTarget.title = titleManga;
        mangaTarget.author = authorManga;
        mangaTarget.year = yearManga;

        document.dispatchEvent(new Event(RENDER_EVENT));
    }
    saveData();
}

  function removeManga(mangaId) {
    const mangaTarget = findMangaIndex(mangaId);
   
    if (mangaTarget === -1) return;
   
    mangas.splice(mangaTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
   
  function undoMangaFromCompleted(mangaId) {
    const mangaTarget = findManga(mangaId);
   
    if (mangaTarget == null) return;
   
    mangaTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findMangaIndex(mangaId) {
    for (const index in mangas) {
      if (mangas[index].id === mangaId) {
        return index;
      }
    }
   
    return -1;
  }

  const dialogOverlay = document.getElementById('dialog-overlay');
  const customDialog = document.getElementById('custom-dialog');
  const cancelButton = document.getElementById('cancelButton');
  const confirmButton = document.getElementById('confirmButton');

  function showDialog(mangaId) {
      mangaIdToRemove = mangaId;
      dialogOverlay.style.display = 'block';
      customDialog.style.display = 'block';
  }

  cancelButton.addEventListener('click', function () {
      dialogOverlay.style.display = 'none';
      customDialog.style.display = 'none';
  });

  confirmButton.addEventListener('click', function () {
      removeManga(mangaIdToRemove);
      dialogOverlay.style.display = 'none';
      customDialog.style.display = 'none';
  });

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(mangas);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }
  
  const SAVED_EVENT = 'saved-manga';
  const STORAGE_KEY = 'TODO_MANGAS';
   
  function isStorageExist() {
    if (typeof (Storage) === 'undefined') {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }
    return true;
  }
  
  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
  });
  
  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const storedMangas = JSON.parse(serializedData); 
  
    if (storedMangas !== null) {
      for (const manga of storedMangas) { 
        mangas.push(manga); 
      }
    }
  
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

