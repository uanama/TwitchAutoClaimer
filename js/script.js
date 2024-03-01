// Utilizza il tipo di const/let per dichiarare le variabili
const toggleButton = document.getElementById('toggleOnOff');
const stateText = document.getElementById('state-text');
const extensionState = document.getElementById('state');

// Utilizza funzioni arrow per una sintassi più concisa
toggleButton.addEventListener('click', toggleButtonClick);

// Utilizza async/await per operazioni asincrone
async function checkAndUpdateCurrentUrl() {
  try {
    const { twitchAutoClaimerObject } = await chrome.storage.local.get('twitchAutoClaimerObject');

    if (twitchAutoClaimerObject && twitchAutoClaimerObject.users.length > 0) {
      const containerElement = document.getElementById('containerTwitchAutoClicker');
      containerElement.innerHTML = ''; // Pulisce il contenuto del container

      const tableElement = document.createElement('table');
      tableElement.classList.add('user-table');

      const headerRow = tableElement.createTHead().insertRow(0);

      // Utilizza una funzione per creare le celle dell'intestazione
      headerRow.appendChild(createTableHeaderCell('', 'center', '#f2f2f2'));
      headerRow.appendChild(createTableHeaderCell('', 'left', '#f2f2f2'));
      headerRow.appendChild(createTableHeaderCell('', 'center', '#f2f2f2'));
      headerRow.appendChild(createTableHeaderCell('', 'center', '#f2f2f2'));
      headerRow.appendChild(createTableHeaderCell('', 'center', '#f2f2f2'));

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
        removeCell.appendChild(createButton('X', 'remove-button', () => removeUserAtIndex(index)));
      });

      containerElement.appendChild(tableElement);
    } else {
      console.log('Nessun oggetto trovato nella cache per la chiave "twitchAutoClaimerObject"');
    }
  } catch (error) {
    console.error('Errore durante il recupero dei dati:', error);
  }
}

function createImageElement(src) {
  const imageElement = document.createElement('img');
  imageElement.src = src;
  imageElement.classList.add('user-image');
  return imageElement;
}

function createNameLink(name) {
  const nameLink = document.createElement('a');
  nameLink.addEventListener('click', () => chrome.tabs.create({ url: `https://www.twitch.tv/${name}` }));
  nameLink.textContent = name;
  nameLink.classList.add('user-name');
  return nameLink;
}

// Funzione per rimuovere l'utente all'indice specificato
function removeUserAtIndex(index) {
  chrome.storage.local.get('twitchAutoClaimerObject', function(result) {
    const twitchAutoClaimerObject = result.twitchAutoClaimerObject;
    if (twitchAutoClaimerObject && twitchAutoClaimerObject.users.length > 0) {
      twitchAutoClaimerObject.users.splice(index, 1);
      chrome.storage.local.set({ 'twitchAutoClaimerObject': twitchAutoClaimerObject }, function() {
        console.log('Utente rimosso dall\'indice:', index);
        checkAndUpdateCurrentUrl();
      });
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

// // Funzione per gestire il click sul bottone di accensione/spegnimento
function toggleButtonClick() {
  chrome.storage.local.get('twitchAutoClaimerOnOffState', function(result) {
    const onOffState = result.twitchAutoClaimerOnOffState;
    const newOnOffState = onOffState !== undefined ? !onOffState : true;

    

    chrome.storage.local.set({ 'twitchAutoClaimerOnOffState': newOnOffState }, function() {
      console.log('Stato aggiornato:', newOnOffState);
      // toggleButton.textContent = newOnOffState ? 'TURN OFF' : 'TURN ON';
      
      extensionState.style.backgroundColor = newOnOffState ? '#6be06b' : 'red';
      stateText.textContent = newOnOffState ? 'ON' : 'OFF';
    });
  });
}

// Funzione per ottenere il valore di On Off
function getOnOffValue() {
  chrome.storage.local.get('twitchAutoClaimerOnOffState', function(result) {
    const onOffState = result.twitchAutoClaimerOnOffState;
    // toggleButton.textContent = onOffState ? 'TURN OFF' : 'TURN ON';
    extensionState.style.backgroundColor = onOffState ? '#6be06b' : 'red';
    stateText.textContent = onOffState ? 'ON' : 'OFF';
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

// Esegui la funzione ogni 5 secondi
checkAndUpdateCurrentUrl();
getOnOffValue();
setInterval(checkAndUpdateCurrentUrl, 5000);
