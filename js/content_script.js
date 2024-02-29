// Recupera il bottone di accensione/spegnimento dal documento
const toggleButton = document.getElementById('toggleOnOff');
let buttonIsOn = false;

function controllaElemento() {
	console.clear();
	const elemento = document.querySelector('.ScCoreButton-sc-ocjdkq-0.ScCoreButtonSuccess-sc-ocjdkq-5.bTXTVH.fEpwrH');
  // ?referrer=raid
  const currentUrl = window.location.href;
  const urlParts = currentUrl.split('/');
  const name = urlParts[urlParts.length - 1];
  let src;

  console.log(name.includes('?referrer=raid'))
	
  if (name != "" && !name.includes('?referrer=raid')) {
    chrome.storage.local.get('twitchAutoClaimerObject', function(result) {
      const twitchAutoClaimerObject = result?.twitchAutoClaimerObject ?? { users: [] };
      const originalName = document.querySelector('h1.CoreText-sc-1txzju1-0.ScTitleText-sc-d9mj2s-0.AAWwv.ezNtJL.InjectLayout-sc-1i43xsx-0.dhkijX.tw-title');
      const originalName2 = document.querySelector('p.CoreText-sc-1txzju1-0.ScTitleText-sc-d9mj2s-0.sghpq.caLSIS.tw-title');

      // Verifica se l'utente è già presente nella lista
      const userIndex = twitchAutoClaimerObject.users.findIndex(user => user.name === name);
      const user = twitchAutoClaimerObject.users.find(user => user.name === name);

      if (userIndex === -1) {
        // Ottenendo il link dell'immagine del profilo
        let finalOriginalName;
        if (originalName) {
          finalOriginalName = originalName.textContent;
        } else if (originalName2) {
          finalOriginalName = originalName2.textContent;
        } else {
          console.log("Nome originale non trovato, impossibile caricare l'immagine.");
        }
        const imageElement = document.querySelector(`img[alt="${finalOriginalName}"]`);
        
        const currentSrc = imageElement.getAttribute('src');
        if (currentSrc !== undefined && currentSrc !== null) {
          src = currentSrc;
        }

        // Se l'utente non è presente, aggiungilo alla lista
        twitchAutoClaimerObject.users.push({ name: name, conteggioClick: 0, imageSrc: src });

        // Salva l'oggetto aggiornato nella cache
        chrome.storage.local.set({ 'twitchAutoClaimerObject': twitchAutoClaimerObject }, function() {
          console.log('Utente aggiunto nella lista:', name);
        });
      } else {
        console.log("nome twitch:", user.name);
        console.log("conteggio click:", user.conteggioClick)
      }

      if (elemento) {
        elemento.click();

        // Incrementa il conteggio di clic per l'utente corrente
        if (userIndex !== -1) {
          twitchAutoClaimerObject.users[userIndex].conteggioClick++;
          chrome.storage.local.set({ 'twitchAutoClaimerObject': twitchAutoClaimerObject }, function() {
            console.log('Click aggiornati per:' + name);
          });
        }
      }
    });
  }
}

// Funzione per settare il valore di On Off dell'estensione
function setOnOffValue() {
  chrome.storage.local.get('twitchAutoClaimerOnOffState', function(result) {
    const onOffState = result.twitchAutoClaimerOnOffState;
    if (onOffState != undefined) {
      buttonIsOn = onOffState;
    } else {
      buttonIsOn = true;
    }
  });
}

function onOffController() {
  // Toggla lo stato di accensione/spegnimento
  chrome.storage.local.get('twitchAutoClaimerOnOffState', function(result) {
    const onOffState = result.twitchAutoClaimerOnOffState;
  });
}

// Esegui la funzione ogni 5 secondi
setOnOffValue();
if (buttonIsOn) {
  controllaElemento();
}

setInterval(function() {
  setOnOffValue();
  if (buttonIsOn) {
    onOffController();
    controllaElemento();
  } 
  
}, 5000);
 
// | | | |  / _ \  |  \  | |  / _ \  | \  / |  / _ \
// | | | | | |_| | |   \ | | | |_| | |  \/  | | |_| |
// | |_| | |  _  | | |\ \| | |  _  | | |\/| | |  _  |
//  \___/  |_| |_| |_| \___| |_| |_| |_|  |_| |_| |_|
