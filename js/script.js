// Utilizza il tipo di const/let per dichiarare le variabili
const toggleButton = document.getElementById('toggleOnOff');
toggleButton.addEventListener('click', toggleButtonClick);
const stateText = document.getElementById('state-text');
const extensionState = document.getElementById('state');
let previousTwitchAutoClaimerObject;

// Headers
let headersCreated = false;
const tableHeaders = [
  { text: 'Header1', align: 'center', color: '#f2f2f2' },
  { text: 'Header2', align: 'left', color: '#f2f2f2' },
  { text: 'Header3', align: 'center', color: '#f2f2f2' },
  { text: 'Header4', align: 'center', color: '#f2f2f2' },
  { text: 'Header5', align: 'center', color: '#f2f2f2' }
];

// Funzione per creare gli header, chiamata una sola volta
function createTableHeaders() {
  const tableElement = document.createElement('table');
  tableElement.classList.add('user-table');

  const headerRow = tableElement.createTHead().insertRow(0);

  tableHeaders.forEach(headerInfo => {
    headerRow.appendChild(createTableHeaderCell(headerInfo.text, headerInfo.align, headerInfo.color));
  });

  const containerElement = document.getElementById('containerTwitchAutoClicker');
  containerElement.appendChild(tableElement);

  headersCreated = true;
}

// Funzione per aggiornare la tabella, chiamata ogni 5 secondi
async function checkAndUpdateCurrentUrl() {
  try {
    const { twitchAutoClaimerObject } = await chrome.storage.local.get('twitchAutoClaimerObject');

    if (twitchAutoClaimerObject && twitchAutoClaimerObject.users.length > 0) {
      if (previousTwitchAutoClaimerObject !== twitchAutoClaimerObject) {
        const containerElement = document.getElementById('containerTwitchAutoClicker');

        // Se gli header non sono stati ancora creati, crea gli header
        if (!headersCreated) {
          createTableHeaders();
        }
  
        const tableElement = containerElement.querySelector('.user-table');
        tableElement.innerHTML = ''; // Pulisce il contenuto della tabella
  
        twitchAutoClaimerObject.users.forEach((user, index) => {
          const row = tableElement.insertRow();
  
          const imageCell = row.insertCell();
          imageCell.appendChild(createImageElement(user.imageSrc));
  
          const nameCell = row.insertCell();
          nameCell.appendChild(createNameLink(user.name));
  
          const cliccatiCell = row.insertCell();
          cliccatiCell.textContent = user.conteggioClick;
          cliccatiCell.classList.add('click-count');
  
          const reorderCell = row.insertCell();
          reorderCell.appendChild(createButton('↑', 'reorder-button', () => moveUser(index, 'up')));
          reorderCell.appendChild(createButton('↓', 'reorder-button', () => moveUser(index, 'down')));
  
          const removeCell = row.insertCell();
          removeCell.appendChild(createButton('X', 'remove-button', () => removeUserByUsername(user.name)));
        });
        // Aggiorna l'oggetto precedente
        previousTwitchAutoClaimerObject = twitchAutoClaimerObject;
      }
    } else {
      console.log('Nessun oggetto trovato nella cache per la chiave "twitchAutoClaimerObject"');
    }
  } catch (error) {
    console.error('Errore durante il recupero dei dati:', error);
  }
}

// Funzione per creare un'immagine con le impostazioni comuni
function createImageElement(src) {
  const imageElement = document.createElement('img');
  imageElement.src = src;
  imageElement.classList.add('user-image');
  return imageElement;
}

// Funzione per creare un link con le impostazioni comuni
function createNameLink(name) {
  const nameLink = document.createElement('a');
  nameLink.addEventListener('click', () => chrome.tabs.create({ url: `https://www.twitch.tv/${name}` }));
  nameLink.textContent = name;
  nameLink.classList.add('user-name');
  return nameLink;
}

// Funzione per rimuovere l'utente con un determinato username
function removeUserByUsername(username) {
  chrome.storage.local.get('twitchAutoClaimerObject', function(result) {
    const twitchAutoClaimerObject = result.twitchAutoClaimerObject;
    if (twitchAutoClaimerObject && twitchAutoClaimerObject.users.length > 0) {
      const indexToRemove = twitchAutoClaimerObject.users.findIndex(user => user.name === username);

      if (indexToRemove !== -1) {
        twitchAutoClaimerObject.users.splice(indexToRemove, 1);
        chrome.storage.local.set({ 'twitchAutoClaimerObject': twitchAutoClaimerObject }, function() {
          console.log('Utente rimosso con username:', username);
          checkAndUpdateCurrentUrl();
        });
      } else {
        console.log('Nessun utente trovato con l\'username:', username);
      }
    } else {
      console.log('Nessun oggetto trovato nella cache per la chiave "twitchAutoClaimerObject"');
    }
  });
}

// Funzione generica per spostare l'utente
function moveUser(index, direction) {
  chrome.storage.local.get('twitchAutoClaimerObject', function(result) {
    const twitchAutoClaimerObject = result.twitchAutoClaimerObject;

    if (twitchAutoClaimerObject && twitchAutoClaimerObject.users.length > 1) {
      let targetIndex;

      // Calcola il nuovo indice in base alla direzione
      if (direction === 'up' && index > 0) {
        targetIndex = index - 1;
      } else if (direction === 'down' && index < twitchAutoClaimerObject.users.length - 1) {
        targetIndex = index + 1;
      } else {
        console.log(`Impossibile spostare l'utente ${direction}.`);
        return;
      }

      // Scambia posizioni
      [twitchAutoClaimerObject.users[index], twitchAutoClaimerObject.users[targetIndex]] =
      [twitchAutoClaimerObject.users[targetIndex], twitchAutoClaimerObject.users[index]];

      chrome.storage.local.set({ 'twitchAutoClaimerObject': twitchAutoClaimerObject }, function() {
        console.log(`Utente spostato verso ${direction}:`, index);
        checkAndUpdateCurrentUrl();
      });
    } else {
      console.log(`Impossibile spostare l'utente verso ${direction}.`);
    }
  });
}

// Funzione per gestire il click sul bottone di accensione/spegnimento
function toggleButtonClick() {
  chrome.storage.local.get('twitchAutoClaimerOnOffState', function(result) {
    const onOffState = result.twitchAutoClaimerOnOffState;
    const newOnOffState = onOffState !== undefined ? !onOffState : true;

    chrome.storage.local.set({ 'twitchAutoClaimerOnOffState': newOnOffState }, function() {
      console.log('Stato aggiornato:', newOnOffState);
      extensionState.style.backgroundColor = newOnOffState ? '#6be06b' : 'red';
      stateText.textContent = newOnOffState ? 'ON' : 'OFF';

      // Aggiungi l'animazione al cambiamento del gradient
      const toggleOnOff = document.getElementById('toggleOnOff');
      toggleOnOff.style.animationName = 'rotateGradient';

      // Rimuovi temporaneamente l'animazione dopo che è stata completata
      toggleOnOff.addEventListener('animationend', function() {
        toggleOnOff.style.animationName = '';
      });
    });
  });
}

// Funzione per ottenere il valore di On Off
function getOnOffValue() {
  chrome.storage.local.get('twitchAutoClaimerOnOffState', function(result) {
    const onOffState = result.twitchAutoClaimerOnOffState;
    if (onOffState !== undefined) {
      buttonIsOn = onOffState;
      extensionState.style.backgroundColor = onOffState ? '#6be06b' : 'red';
      stateText.textContent = onOffState ? 'ON' : 'OFF';
    } else {
      chrome.storage.local.set({ 'twitchAutoClaimerOnOffState': true }, function() {
        extensionState.style.backgroundColor = '#6be06b';
        stateText.textContent = 'ON';
        console.log('Stato aggiornato:', true);
      });
    }
   
    
  });
}

// Funzione per creare un elemento th con le impostazioni comuni
function createTableHeaderCell(text, textAlign = 'center', color = '#f2f2f2') {
  const headerCell = document.createElement('th');
  headerCell.textContent = text;
  headerCell.style.textAlign = textAlign;
  headerCell.style.color = color;
  return headerCell;
}

// Funzione per creare un pulsante con le impostazioni comuni
function createButton(text, className, clickHandler) {
  const button = document.createElement('button');
  button.textContent = text;
  button.classList.add(className);
  button.addEventListener('click', clickHandler);
  return button;
}

function clearUserList() {
  chrome.storage.local.get('twitchAutoClaimerObject', function(result) {
      const twitchAutoClaimerObject = result.twitchAutoClaimerObject;
      if (twitchAutoClaimerObject && twitchAutoClaimerObject.users.length > 0) {
          // Pulisce la lista degli utenti
          twitchAutoClaimerObject.users = [];
          chrome.storage.local.set({ 'twitchAutoClaimerObject': twitchAutoClaimerObject }, function() {
              console.log('Lista utenti cancellata.');
              checkAndUpdateCurrentUrl(); // Aggiorna la visualizzazione della tabella
          });
      } else {
          console.log('Nessun oggetto trovato nella cache per la chiave "twitchAutoClaimerObject"');
      }
  });
}

const clearListButton = document.getElementById('clearList');
clearListButton.addEventListener('click', clearUserList);

// Esegui la funzione ogni 5 secondi
checkAndUpdateCurrentUrl();
getOnOffValue();
setInterval(checkAndUpdateCurrentUrl, 1000);
