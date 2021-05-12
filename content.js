//https://medium.com/swlh/programming-a-chess-bot-for-chess-com-fa6bd7e1da76

window.onload = () =>{

    // get classes for elements for functions on different pages
    window['currentUrl'] = window.location.href;
    
    // Observe behavior for analysis mode
    if (currentUrl.includes("analysis")){
        window['movesListBoxClass'] = '.move-list.horizontal-move-list';
        window['moveNodeClass'] = '.move-node';
        window['pageType'] = "analysis";
    }
    // Observe behavior for play mode
    else if (currentUrl.includes("play")){
        window['movesListBoxClass'] = '.layout-move-list.vertical-move-list';
        window['moveNodeClass'] = '.move';
        window['pageType'] = "play";
    }
    // Observe behavior for daily play mode
    else if (currentUrl.includes("daily")){
        window['movesListBoxClass'] = '.move-list-move-list.vertical-move-list';
        window['moveNodeClass'] = '.move';
        window['pageType'] = "daily";
    }
    // Observe behavior for live game mode
    else if (currentUrl.includes("live")){
        window['movesListBoxClass'] = 'move-list-wrapper.move-list-move-list.move-list-move-list';
        window['moveNodeClass'] = '.move';
        window['pageType'] = "live";
    }

    // Create button for enabling Freedom Mode
    const button = document.createElement('button');
    var buttonImageUrl = chrome.runtime.getURL('images/speech-icon.png');
    button.id = "freedomButton";
    button.className = "freedomButtonClass";
    button.innerHTML = '<img src="' + buttonImageUrl + '" style="width:30px;" />';
    
    if (pageType == "play") {
        var checkExist = setInterval(function() {
           if ($('.secondary-controls-left.secondary-controls-group').length) {
              document.querySelector('.secondary-controls-left.secondary-controls-group').append(button);
              clearInterval(checkExist);
           }
        }, 100); // check every 100ms
    
    }
    else if (pageType == "analysis"){
        var checkExist = setInterval(function() {
           if ($('.secondary-controls-component').length) {
              document.querySelector('.secondary-controls-component').append(button);
              clearInterval(checkExist);
           }
        }, 100); // check every 100ms
    }
    else if (pageType == "daily"){
        var checkExist = setInterval(function() {
           if ($('.daily-game-footer-middle').length) {
              document.querySelector('.daily-game-footer-middle').append(button);
              clearInterval(checkExist);
           }
        }, 100); // check every 100ms
    }
    else if (pageType == "live"){
        var checkExist = setInterval(function() {
           if ($('.board-layout-controls').length) {
              document.querySelector('.board-layout-controls').append(button);
              clearInterval(checkExist);
           }
        }, 100); // check every 100ms
    }
    
    

    // Create an observer instance linked to the callback function
    window['freedomEnabled'] = false;
    window['observer'] = new MutationObserver(callback);
    
    window['confirm'] = function(question, text, confirmButtonText, callback) {
        Swal.fire({
              title: question,
              imageUrl: chrome.runtime.getURL('images/freedomChess.png'),
              imageHeight: 100,
              imageAlt: 'Freedom Logo',
              text: text,
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: confirmButtonText,
        }).then((confirmed) => {
            callback(confirmed && confirmed.value == true);
        });
    }
    
    // switch enable/disable Freedom Mode
    window['enableDisableFreedomMode'] = function() {
        
        if (freedomEnabled == false) {
        
            question = 'Você deseja ativar o Modo Freedom?';
            text = "Você passará a falar os lances ao invés de usar o mouse.";
            confirmButtonText = 'Sim, ative!';
            
            confirm(question, text, confirmButtonText, function (confirmed) {
                if (confirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: "Ativado!",
                        text: "O modo Freedom está ativo.",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    setTimeout(function(){ 
                        enableFreedomMode();
                    }, 1500);
                    freedomEnabled = true;
                }
                else {
                    freedomEnabled = false;
                }
            });
        }
                
        else if (freedomEnabled == true) {
            question = 'Você deseja desativar o Modo Freedom?';
            text = "Você passará a fazer os lances com o mouse normalmente.";
            confirmButtonText = 'Sim, desative!';
            
            confirm(question, text, confirmButtonText, function (confirmed) {
                if (confirmed) {
                    observer.disconnect(); 
                    Swal.fire({
                        icon: 'success',
                        title: "Destivado!",
                        text: "O modo Freedom foi desativado.",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    freedomEnabled = false;
                }
                else {
                    freedomEnabled = true;
                }
            });
        }
        return;
    }
    
    // button click behavior
    button.addEventListener("click", function(){
        enableDisableFreedomMode();
    }, false);

}


// Debug for x y coordinates on screen
function enableMouseCoordinatesDebug() {
    document.onmousemove = function(e){
    var x = e.pageX;
    var y = e.pageY;
    e.target.title = "X is "+x+" and Y is "+y;
    };
}


// See board orientation to get player color
function getPlayerColor() {
    const gameBoard = document.querySelector('.board');
    var gameBoardClasses = gameBoard.className.split(' ');
    if (gameBoardClasses.includes('flipped')){
        playerColor = "b";
    }
    else{
        playerColor = "w";
    }
    return playerColor;
}


var validationMessage = null;

// cancel move in case no source or destination provided, or strange move
function validateSourceAndDestinationSquares(source, destination){

    var possibleColumns = [ "a", "b", "c", "d", "e", "f", "g", "h" ];
    var possibleRows = [ "1", "2", "3", "4", "5", "6", "7", "8" ];
    
    if (source == null) {
        validationMessage = ('Nenhuma casa de origem informada');
    	return false;
    } 
    else if (destination == null) {
        validationMessage = ("Nenhuma casa de destino informada.");
        return false;
    }
    else if (source.length != 2) {
        validationMessage = ("Problema com casa de origem do lance: " + source);
        return false;
    }
    else if (destination.length != 2) {
        validationMessage = ("Problema com casa de destino do lance: " + destination);
        return false;
    }
    else if (!possibleColumns.includes(source[0])) {
        validationMessage = ("Na casa de origem, não existe a coluna " + source[0]);
        return false;    
    }
    else if (!possibleColumns.includes(destination[0])) {
        validationMessage = ("Na casa de destino, não existe a coluna " + destination[0]);
        return false;    
    }
    else if (!possibleRows.includes(source[1])) {
        validationMessage = ("Na casa de origem, não existe a linha " + source[1]);
        return false;    
    }
    else if (!possibleRows.includes(destination[1])) {
        validationMessage = ("Na casa de destino, não existe a linha " + destination[1]);
        return false;    
    }
    else {
        return true;
    }
}


// check for legal move
function checkForLegalMove(referenceMovesMadeCount){  
    var newMovesMadeCount = getMovesCount();
    if (newMovesMadeCount == referenceMovesMadeCount){
        Swal.fire({
            icon: 'warning',
            title: "Lance ilegal, por favor faça seu lance novamente",
            showConfirmButton: false,
            timer: 1500
        });
        window.setTimeout(function(){ 
            getTheMoveInputsAndMakeMove(); 
        }, 2000);  
    }
    return true;
}

function getBrowserVoices(synth) {
    return new Promise(
        function (resolve, reject) {
            let id;

            id = setInterval(() => {
                if (synth.getVoices().length !== 0) {
                    resolve(synth.getVoices());
                    clearInterval(id);
                }
            }, 10);
        }
    )
}

async function getVoice(synth) {
    const voices = await getBrowserVoices(synth);

    return voices.find((voice) => /pt-BR/.test(voice.lang));
}

async function speak(phrase) {
    const synth = window.speechSynthesis;
    if (!synth) reject('Speak API is not supported!')

    const utterance = new SpeechSynthesisUtterance();

    utterance.text = phrase;
    utterance.lang = 'ja-JP';
    utterance.voice = await getVoice(synth);
    utterance.rate = 1;

    synth.speak(utterance);
}

// get the move inputs, validate and check for legal
async function getTheMoveInputsAndMakeMove() {
    var validateInputs = false;
    
    const { value: source } = await Swal.fire({
        input: 'text',
        inputLabel: 'Por favor digite a casa de origem de seu lance',
        inputPlaceholder: 'Exemplo: e2',
        position: "center-end",
        customClass: {
            popup: 'moveInputClass',
        }
    });
    
    const { value: destination } = await Swal.fire({
        input: 'text',
        inputLabel: 'Por favor digite a casa de destino de seu lance',
        inputPlaceholder: 'Exemplo: e4',
        position: "center-end",
        customClass: {
            popup: 'moveInputClass',
        }
    });

    validateInputs = validateSourceAndDestinationSquares(source, destination);
    if (validateInputs == false) {
        Swal.fire({
            icon: 'warning',
            title: validationMessage + ". Por favor faça seu lance novamente",
            showConfirmButton: false,
            timer: 1500,
            position: "center-end",
            customClass: {
                popup: 'moveInputClass',
            }
        });
        window.setTimeout(function(){ 
            getTheMoveInputsAndMakeMove(); 
        }, 2000);  
    }
    else {
        // passed validation, make the move        
        // get moves count before making the move to validate legal move after move attempt
        if (document.querySelector(movesListBoxClass)){
            var referenceMovesMadeCount = getMovesCount();
        }
        else{
            var movesMadeCount = 0;    
        }
        
        makeMove(source, destination);
        
        var legalMovePassed = false;
        
        // check if move is legal
        window.setTimeout(function(){ 
            legalMovePassed = checkForLegalMove(referenceMovesMadeCount);
        }, 1000);
        
        if (legalMovePassed == true) {
            return true;
        }
    } 
}




// get moves count
function getMovesCount(){
    if (pageType == "analysis"){
        if (document.querySelector(movesListBoxClass) && document.querySelector(movesListBoxClass).firstChild){
            var localMovesMadeCount = document.querySelector(movesListBoxClass).childElementCount;
        }
        else {
            var localMovesMadeCount = 0;
        }
    }
    else if (pageType == "play"){
        if (document.querySelector(movesListBoxClass) && document.querySelector(movesListBoxClass).firstChild){
            var movesArray = document.querySelectorAll(moveNodeClass);
            var lastNodeArray = movesArray[movesArray.length - 1].childNodes;
            var localMovesMadeCount = ((movesArray.length) * 2);
            if (lastNodeArray.length == 2){
                localMovesMadeCount --;
            }
        }
        else {
            var localMovesMadeCount = 0;
        }
    }
    else if (pageType == "daily"){
        if (document.querySelector(movesListBoxClass) && document.querySelector(movesListBoxClass).firstChild){
            var movesArray = document.querySelectorAll(moveNodeClass);
            var lastNodeArray = movesArray[movesArray.length - 1].childNodes;
            var localMovesMadeCount = ((movesArray.length) * 2);
            if (lastNodeArray.length == 3){
                localMovesMadeCount --;
            }
        }
        else {
            var localMovesMadeCount = 0;
        }
    }
    else if (pageType == "live"){
        if (document.querySelector(movesListBoxClass) && document.querySelector(movesListBoxClass).firstChild){
            var movesArray = document.querySelectorAll(moveNodeClass);
            var lastNodeArray = movesArray[movesArray.length - 1].childNodes;
            var localMovesMadeCount = ((movesArray.length) * 2);
            if (lastNodeArray.length == 3){
                localMovesMadeCount --;
            }
        }
        else {
            var localMovesMadeCount = 0;
        }
    }      
    return localMovesMadeCount;
}


function getLastMoveMade(){
    
    var movesPlayed = getMovesCount();
    
    // in case we just started a game as black and expecting opponent to play
    if(movesPlayed == 0) {
        //The node we need does not exist yet.
        //Wait 500ms and try again
        window.setTimeout(function(){
            getLastMoveMade();
        }, 500);
        return;
    }

    var movesMade = document.querySelectorAll(moveNodeClass);
    var lastMoveMade = movesMade[movesMade.length- 1];  
    
    if (pageType == "play"){
        var lastMoveMadeDivs = lastMoveMade.childNodes;
        var lastMoveMade = lastMoveMadeDivs[lastMoveMadeDivs.length - 1];
    }   
    else if (pageType == "daily"){
        var lastMoveMadeDivs = lastMoveMade.childNodes;
        if (movesMadeCount % 2 == 0){
            var lastMoveMade = lastMoveMadeDivs[lastMoveMadeDivs.length - 1];
        }
        else if (movesMadeCount % 2 != 0){
            var lastMoveMade = lastMoveMadeDivs[lastMoveMadeDivs.length - 2];
        }
    }
    else if (pageType == "live"){
        var lastMoveMadeDivs = lastMoveMade.childNodes;
        if (movesMadeCount % 2 == 0){
            var lastMoveMade = lastMoveMadeDivs[lastMoveMadeDivs.length - 2];
        }
        else if (movesMadeCount % 2 != 0){
            var lastMoveMade = lastMoveMadeDivs[lastMoveMadeDivs.length - 2];
        }
    }
    // remove move number if exists
    var lastMoveMadeString = lastMoveMade.textContent;
    if (lastMoveMadeString.split(" ")) {
        var lastMoveMadeStringArray = lastMoveMadeString.split(" ");
        lastMoveMadeString = lastMoveMadeStringArray[lastMoveMadeStringArray.length - 1];
    }  
    return lastMoveMadeString;
}




// make the move
function makeMove(source, destination) {
    
    // get player color
    var playerColor = getPlayerColor();
    
    
    // get board to get screen position and offsets and also square width
    const gameBoard = document.querySelector('.board');
    const offsetX = gameBoard.getBoundingClientRect().x;
    const offsetY = gameBoard.getBoundingClientRect().y;
    const squareWidth = gameBoard.getBoundingClientRect().width / 8;
    const bubbles = true;
    
    // dicionário de conversão de casa em coordenadas
    var dict = { "a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8 };
    
    // origin square click
    var sourceColumn = source[0];
    var sourceRow = source[1];
    
    if (playerColor == "w") {
        var clientX = squareWidth * (dict[sourceColumn] - 0.5) + offsetX;
        var clientY = squareWidth * (8 + 0.5 - parseInt(sourceRow)) + offsetY;    
    }
    else {
        var clientX = squareWidth * (9 - dict[sourceColumn] - 0.5) + offsetX;
        var clientY = squareWidth * (- 0.5 + parseInt(sourceRow)) + offsetY;
    }
    
    var event = new PointerEvent('pointerdown', { clientX, clientY, bubbles });
    gameBoard.dispatchEvent(event);
    
    // destination square click 
    var destinationColumn = destination[0];
    var destinationRow = destination[1]; 
    
    if (playerColor == "w") {
        clientX = squareWidth * (dict[destinationColumn] - 0.5) + offsetX;
        clientY = squareWidth * (8 + 0.5 - parseInt(destinationRow)) + offsetY;   
    }
    else {
        clientX = squareWidth * (9 - dict[destinationColumn] - 0.5) + offsetX;
        clientY = squareWidth * (- 0.5 + parseInt(destinationRow)) + offsetY;   
    }
    event = new PointerEvent('pointerup', { clientX, clientY, bubbles });
    document.querySelector('html').dispatchEvent(event); 
    
}



// Observe if moves list has changed
function startObservingMoves() {

    var movesPlayed = getMovesCount();
            
    // in case we just started a game as black and expecting opponent to play
    if(movesPlayed == 0) {
        //The node we need does not exist yet.
        //Wait 500ms and try again
        window.setTimeout(function(){
            startObservingMoves();
        }, 500);
        return;
    }
    
    // Select the node that will be observed for mutations
    if (pageType == "live") {
        var targetNode = document.querySelector(movesListBoxClass).firstChild;
    }
    else {
        var targetNode = document.querySelector(movesListBoxClass);
    }
    
    // Options for the observer (which mutations to observe)
    var config = {
      attributes: false,
      childList: true,
      subtree: true
    };
    
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // force the first callback 
    window["callback"]();   

}



// Callback function to execute when mutations are observed
var callback = function() {

    if (freedomEnabled == true) {
        // get player color
        var playerColor = getPlayerColor();
    
        // get moves count
        window['movesMadeCount'] = getMovesCount();
    
        // get last move made
        var lastMoveMadeString = getLastMoveMade();
    
        // make the alert that move has been played
        window.setTimeout(function(){
            if (movesMadeCount %2 == 0) {
                Swal.fire({
                    icon: 'success',
                    title: "As Pretas jogaram " + lastMoveMadeString + ", agora as Brancas jogam!",
                    showConfirmButton: false,
                    timer: 1500,
                    position: "center-end",
                    customClass: {
                        popup: 'moveInputClass',
                    }
                });
                if (playerColor == "w") {
                    window.setTimeout(function(){ 
                        getTheMoveInputsAndMakeMove(); 
                    }, 1000);  
                }
            }
            else{
                Swal.fire({
                    icon: 'success',
                    title: "As Brancas jogaram " + lastMoveMadeString + ", agora as Pretas jogam!",
                    showConfirmButton: false,
                    timer: 1500,
                    position: "center-end",
                    customClass: {
                        popup: 'moveInputClass',
                    }
                });
                if (playerColor == "b") {
                    window.setTimeout(function(){ 
                        getTheMoveInputsAndMakeMove(); 
                    }, 1000);  
                }
            }
        }, 500);
    
    }
    else {
        window['observer'].disconnect(); 
    }    
};



// enable Freedom Chess Mode
function enableFreedomMode() {

    // enableMouseCoordinatesDebug();
    
    // get player color
    var playerColor = getPlayerColor();
    
    // get moves count
    var inicialMovesMadeCount = getMovesCount();
        
    // make first move if you are white or expect move from opponent if you are black
    if (inicialMovesMadeCount == 0){
        if (playerColor == "w"){
            getTheMoveInputsAndMakeMove();
        }
    }
    
    // start observing opponent's moves
    startObservingMoves();
}










    

