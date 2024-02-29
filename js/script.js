// Recupera il bottone di accensione/spegnimento
const toggleButton = document.getElementById('toggleOnOff');
toggleButton.addEventListener('click', toggleButtonClick);

// Funzione per controllare e aggiornare currentUrl ogni 5 secondi
function checkAndUpdateCurrentUrl() {
  // let name = "";

  // chrome.storage.local.get('twitchAutoClaimerLiveName', function(result) {
  //   name = result.twitchAutoClaimerLiveName;
  // });

  
  
  chrome.storage.local.get('twitchAutoClaimerObject', function(result) {
    const twitchAutoClaimerObject = result.twitchAutoClaimerObject;

    if (twitchAutoClaimerObject && twitchAutoClaimerObject.users.length > 0) {
      const containerElement = document.getElementById('containerTwitchAutoClicker');
      containerElement.innerHTML = ''; // Pulisce il contenuto del container

      // Crea una tabella
      const tableElement = document.createElement('table');
      tableElement.classList.add('user-table'); // Aggiungi classe CSS per la tabella

      // Intestazione della tabella
      const headerRow = tableElement.createTHead().insertRow(0);

      // Header per "Immagine"
      const imageHeader = document.createElement('th');
      imageHeader.textContent = '';
      headerRow.appendChild(imageHeader);

      // Header per "Nome"
      const nameHeader = document.createElement('th');
      nameHeader.textContent = '';
      nameHeader.style.textAlign = 'left';
      nameHeader.style.color = 'white';
      headerRow.appendChild(nameHeader);

      // Header per "Elementi Cliccati"
      const cliccatiHeader = document.createElement('th');
      cliccatiHeader.textContent = '';
      cliccatiHeader.style.textAlign = 'center';
      cliccatiHeader.style.color = 'white';
      headerRow.appendChild(cliccatiHeader);

      // Header per "Rimuovi"
      const removeHeader = document.createElement('th');
      removeHeader.textContent = '';
      headerRow.appendChild(removeHeader);

      // Itera su ogni utente nell'array
      twitchAutoClaimerObject.users.forEach((user, index) => {
        // Crea un iframe
        // var iframe = document.createElement('iframe');
        // let iframeText = "";
        // iframe.src = 'https://www.twitch.tv/' + user.name;
        // document.body.appendChild();

        // iframe.contentDocument.querySelector('p.CoreText-sc-1txzju1-0.bfNjIO');
        // if (iframe) {
        //   iframeText = iframe.textContent;
        // }
        

        // Aggiungi una riga per ogni utente
        const row = tableElement.insertRow(index + 1);

        // Aggiungi l'immagine nella colonna "Immagine"
        const imageCell = row.insertCell(0);
        const imageElement = document.createElement('img');
        imageElement.src = user.imageSrc; // Assuming user.imageSrc is the property containing the image source
        imageElement.style.width = '30px'; // Adjust the width as needed
        imageElement.style.height = '30px'; // Adjust the height as needed
        imageElement.style.marginRight = '10px';
        
        imageElement.style.borderRadius = '50%';
        imageCell.appendChild(imageElement);

        // Aggiungi il nome nella colonna "Nome"
        const nameCell = row.insertCell(1);
        const nameLink = document.createElement('a');
        nameLink.addEventListener('click', function () {
          // Apre una nuova scheda con l'URL desiderato
          chrome.tabs.create({ url: 'https://www.twitch.tv/' + user.name });
        });
        nameLink.textContent = user.name;
        nameLink.style.color = '#6441a5'; // Imposta il colore del testo
        nameLink.style.textDecoration = 'none'; // Sottolinea il link
        nameLink.style.cursor = 'pointer';
        nameLink.style.textAlign = 'left';
        nameCell.appendChild(nameLink);

        // Aggiungi il conteggio dei clic nella colonna "Elementi Cliccati"
        const cliccatiCell = row.insertCell(2);
        cliccatiCell.textContent = user.conteggioClick;
        cliccatiCell.style.color = '#ffffff'; // Imposta il colore del testo
        cliccatiCell.style.textAlign = 'center';
        cliccatiCell.style.width = '100%';

        // Aggiungi la colonna "Rimuovi" con una "X" e aggiungi l'evento di rimozione
        const removeCell = row.insertCell(3);
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.style.backgroundColor = 'red';
        removeButton.style.borderRadius = '15px';
        removeButton.style.borderWidth = '0px';
        removeButton.style.width = '20px';
        removeButton.style.height = '20px';
        removeButton.style.color = 'white';
        removeButton.style.textAlign = 'center';
        removeButton.style.fontSize = '10px';
        removeButton.style.cursor = 'pointer';
        removeButton.style.marginRight = '10px';
        removeButton.addEventListener('click', function () {
      // Chiamata alla funzione per rimuovere l'utente
      removeUserAtIndex(index);
        });
        removeCell.appendChild(removeButton);

        // removeCell.style.display = 'flex';
        removeCell.style.width = '100%';
        removeCell.style.justifyContent = 'center';
        removeCell.style.textAlign = 'right';
      });

      // Aggiungi la tabella al container
      containerElement.appendChild(tableElement);
    } else {
      console.log('Nessun oggetto trovato nella cache per la chiave "twitchAutoClaimerObject"');
    }
  });
}

// Funzione per rimuovere l'utente all'indice specificato
function removeUserAtIndex(index) {
  chrome.storage.local.get('twitchAutoClaimerObject', function(result) {
    const twitchAutoClaimerObject = result.twitchAutoClaimerObject;

    if (twitchAutoClaimerObject && twitchAutoClaimerObject.users.length > 0) {
      // Rimuovi l'utente dalla lista
      twitchAutoClaimerObject.users.splice(index, 1);

      // Aggiorna l'oggetto nella cache
      chrome.storage.local.set({ 'twitchAutoClaimerObject': twitchAutoClaimerObject }, function() {
        console.log('Utente rimosso dall\'indice:', index);
        // Aggiorna la visualizzazione
        checkAndUpdateCurrentUrl();
      });
    } else {
      console.log('Nessun oggetto trovato nella cache per la chiave "twitchAutoClaimerObject"');
    }
  });
}

// Funzione per gestire il click sul bottone di accensione/spegnimento
function toggleButtonClick() {
  // Toggla lo stato di accensione/spegnimento
  chrome.storage.local.get('twitchAutoClaimerOnOffState', function(result) {
    const onOffState = result.twitchAutoClaimerOnOffState;
    if (onOffState != undefined) {
      chrome.storage.local.set({ 'twitchAutoClaimerOnOffState': !onOffState }, function() {
        console.log('Stato aggiornato:', !onOffState);
        
        // Aggiorna il testo del bottone in base allo stato corrente
        toggleButton.textContent = !onOffState ? 'SPEGNI' : 'ACCENDI';
      });
    } else {
      chrome.storage.local.set({ 'twitchAutoClaimerOnOffState': true}, function() {
        console.log('Stato aggiornato:', true);
        // Aggiorna il testo del bottone in base allo stato corrente
        toggleButton.textContent = 'SPEGNI';
      });
    }
    // Salva il nuovo stato nella storage
    
  });
}

// Funzione per ottenere il valore di On Off
function getOnOffValue() {
  chrome.storage.local.get('twitchAutoClaimerOnOffState', function(result) {
    const onOffState = result.twitchAutoClaimerOnOffState;
    if (onOffState != undefined) {
      toggleButton.textContent = onOffState ? 'SPEGNI' : 'ACCENDI';
    } else {
      toggleButton.textContent = 'SPEGNI';
    }
  });
}

// Funzione per verificare la presenza dell'elemento nell'iframe
function controllaPresenzaElemento() {
  var elementoPresente = iframe.contentDocument.querySelector('#idElemento');

  if (elementoPresente) {
    console.log('L\'elemento è presente nell\'iframe.');
  } else {
    console.log('L\'elemento non è presente nell\'iframe.');
  }
}

// Esegui la funzione ogni 5 secondi
checkAndUpdateCurrentUrl();
getOnOffValue();
setInterval(function() {
	checkAndUpdateCurrentUrl();
}, 5000);

// | | | |  / _ \  |  \  | |  / _ \  | \  / |  / _ \
// | | | | | |_| | |   \ | | | |_| | |  \/  | | |_| |
// | |_| | |  _  | | |\ \| | |  _  | | |\/| | |  _  |
//  \___/  |_| |_| |_| \___| |_| |_| |_|  |_| |_| |_|