// Recupera il bottone di accensione/spegnimento dal documento
const toggleButton = document.getElementById('toggleOnOff');
let buttonIsOn = false;

// Definisci le costanti per i query selector
const claimButtonSelector = '.ScCoreButton-sc-ocjdkq-0.ScCoreButtonSuccess-sc-ocjdkq-5.ljgEdo.fEpwrH';
const originalNameSelector1 = 'h1.CoreText-sc-1txzju1-0.ScTitleText-sc-d9mj2s-0.AAWwv.bzDGwQ.InjectLayout-sc-1i43xsx-0.dhkijX.tw-title';
const originalNameSelector2 = 'p.CoreText-sc-1txzju1-0.ScTitleText-sc-d9mj2s-0.sghpq.caLSIS.tw-title';

function controllaElemento() {
  let name = "";
  console.clear();
  const elemento = document.querySelector(claimButtonSelector);
  const currentUrl = window.location.href;
  const urlPath = currentUrl.replace('https://www.twitch.tv/' || 'https://www.twitch.tv', '');
  if (urlPath !== "") {
    name = urlPath;
    name = name.replace(/\?referrer=raid/g, '');
    name = name.replace('moderator/', '');
    name = (
      name.includes("search?") || 
      name.includes("directory") || 
      name.includes("videos") ||
      name.includes("clip") ||
      name.includes("clips?") ||
      name.includes("about") ||
      name.includes("schedule")
    ) ? "" : name;
  }

  let src;

  if (name !== "") {
    chrome.storage.local.get('twitchAutoClaimerObject', function(result) {
      const twitchAutoClaimerObject = result?.twitchAutoClaimerObject ?? { users: [] };
      

      // Verifica se l'utente è già presente nella lista
      const userIndex = twitchAutoClaimerObject.users.findIndex(user => user.name === name);
      const user = twitchAutoClaimerObject.users.find(user => user.name === name);

      if (userIndex === -1) {
        // Ottenendo il link dell'immagine del profilo
        const originalName = document.querySelector(originalNameSelector1);
        const originalName2 = document.querySelector(originalNameSelector2);
        let finalOriginalName;
        if (originalName) {
          finalOriginalName = originalName.textContent;
        } else if (originalName2) {
          finalOriginalName = originalName2.textContent;
        } else {
          console.log("Nome originale non trovato, impossibile caricare l'immagine.");
        }
        const imageElement = document.querySelector(`img[alt="${finalOriginalName}"]`);

        const currentSrc = imageElement?.getAttribute('src');
        if (currentSrc) {
          src = currentSrc;
        }

        // Se l'utente non è presente, aggiungilo alla lista
        twitchAutoClaimerObject.users.push({ name: name, conteggioClick: 0, imageSrc: src });

        // Salva l'oggetto aggiornato nella cache
        chrome.storage.local.set({ 'twitchAutoClaimerObject': twitchAutoClaimerObject }, function() {
          console.log('Utente aggiunto nella lista:', name);
        });
      } else {
        console.log("Nome twitch:", user.name);
        console.log("Conteggio click:", user.conteggioClick);
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
    if (onOffState !== undefined) {
      buttonIsOn = onOffState !== undefined ? onOffState : true;
    } else {
      chrome.storage.local.set({ 'twitchAutoClaimerOnOffState': true }, function() {
        console.log('Stato aggiornato:', true);
      });
    }
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
    controllaElemento();
  }
}, 5000);
