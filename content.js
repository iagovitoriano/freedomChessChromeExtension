//https://medium.com/swlh/programming-a-chess-bot-for-chess-com-fa6bd7e1da76window.onload = () =>{    // get classes for elements for functions on different pages    var currentUrl = window.location.href;        // Observe behavior for analysis mode    if (currentUrl.includes("analysis")){        var movesListBoxClass = '.move-list.horizontal-move-list';        var moveNodeClass = '.move-node';        var pageType = "analysis";    }    // Observe behavior for play mode    else if (currentUrl.includes("play")){        var movesListBoxClass = '.layout-move-list.vertical-move-list';        var moveNodeClass = '.move';        var pageType = "play";    }    // Observe behavior for daily play mode    else if (currentUrl.includes("daily")){        var movesListBoxClass = '.move-list-move-list.vertical-move-list';        var moveNodeClass = '.move';        var pageType = "daily";    }    // Create button for enabling Freedom Mode    const button = document.createElement('button');    var buttonImageUrl = chrome.runtime.getURL('images/speech-icon.png');    button.id = "freedomButton";    //button.textContent = "Freedom";    button.className = "freedomButtonClass";    button.innerHTML = '<img src="' + buttonImageUrl + '" style="width:100%;" />';    if (document.querySelector('.layout-controls')) {        document.querySelector('.layout-controls').append(button);    }    if (document.querySelector('.board-layout-controls')){        document.querySelector('.board-layout-controls').append(button);        }    button.addEventListener('click', () => enableFreedomMode(movesListBoxClass, moveNodeClass, pageType));        }// Debug for x y coordinates on screenfunction enableMouseCoordinatesDebug() {    document.onmousemove = function(e){    var x = e.pageX;    var y = e.pageY;    e.target.title = "X is "+x+" and Y is "+y;    };}// See board orientation to get player colorfunction getPlayerColor() {    const gameBoard = document.querySelector('.board');    var gameBoardClasses = gameBoard.className.split(' ');    if (gameBoardClasses.includes('flipped')){        playerColor = "b";    }    else{        playerColor = "w";    }    return playerColor;}// source square for movefunction getSourceSquare() {    var source = prompt("Por favor digite a casa de origem de seu lance");    return source;}// destination square for movefunction getDestinationSquare() {    var destination = prompt("Por favor digite a casa de destino de seu lance");    return destination;}// cancel move in case no source or destination provided, or strange movefunction validateSourceAndDestinationSquares(source, destination){    var possibleColumns = [ "a", "b", "c", "d", "e", "f", "g", "h" ];    var possibleRows = [ "1", "2", "3", "4", "5", "6", "7", "8" ];        if (source == null) {        alert("Nenhuma casa de origem informada.");        return false;    }    else if (destination == null) {        alert("Nenhuma casa de destino informada.");        return false;    }    else if (source.length != 2) {        alert("Problema com casa de origem do lance: " + source);        return false;    }    else if (destination.length != 2) {        alert("Problema com casa de destino do lance: " + destination);        return false;    }    else if (!possibleColumns.includes(source[0])) {        alert("Na casa de origem, não existe a coluna " + source[0]);        return false;        }    else if (!possibleColumns.includes(destination[0])) {        alert("Na casa de destino, não existe a coluna " + destination[0]);        return false;        }    else if (!possibleRows.includes(source[1])) {        alert("Na casa de origem, não existe a linha " + source[1]);        return false;        }    else if (!possibleRows.includes(destination[1])) {        alert("Na casa de destino, não existe a linha " + destination[1]);        return false;        }    else {        return true;    }}// get moves countfunction getMovesCount(movesListBoxClass, moveNodeClass, pageType){    if (pageType == "analysis"){        if (document.querySelector(movesListBoxClass)){            var movesMadeCount = document.querySelector(movesListBoxClass).childElementCount;        }        else {            var movesMadeCount = 0;        }    }    else if (pageType == "play"){        if (document.querySelector(movesListBoxClass)){            var movesArray = document.querySelectorAll(moveNodeClass);            var lastNodeArray = movesArray[movesArray.length - 1].childNodes;            var movesMadeCount = ((movesArray.length) * 2);            if (lastNodeArray.length == 2){                movesMadeCount --;            }        }        else {            var movesMadeCount = 0;        }    }          return movesMadeCount;}function getLastMoveMade(movesListBoxClass, moveNodeClass, pageType){    var movesMade = document.querySelectorAll(moveNodeClass);    var lastMoveMade = movesMade[movesMade.length- 1];      if (pageType == "play"){        var lastMoveMadeDivs = lastMoveMade.childNodes;        lastMoveMade = lastMoveMadeDivs[lastMoveMadeDivs.length - 1];    }       // remove move number if exists    var lastMoveMadeString = lastMoveMade.textContent;    if (lastMoveMadeString.split(" ")) {        var lastMoveMadeStringArray = lastMoveMadeString.split(" ");        lastMoveMadeString = lastMoveMadeStringArray[lastMoveMadeStringArray.length - 1];    }      return lastMoveMadeString;}// check for legal movefunction checkForLegalMove(movesListBoxClass, moveNodeClass, pageType, movesMadeCount){      var newMovesMadeCount = getMovesCount(movesListBoxClass, moveNodeClass, pageType);    if (newMovesMadeCount == movesMadeCount){        alert("Lance ilegal, por favor faça seu lance novamente");        source = getSourceSquare();        destination = getDestinationSquare();        // validate source and destination squares        var validateInputs = validateSourceAndDestinationSquares(source, destination);        if (validateInputs == false) {            return;        }        else {            makeMove(source, destination, movesListBoxClass, moveNodeClass, pageType)        }    }  }// make the movefunction makeMove(source, destination, movesListBoxClass, moveNodeClass, pageType) {        // get player color    var playerColor = getPlayerColor();        // get moves count before making the move to validate legal move after move attempt    if (document.querySelector(movesListBoxClass)){        var movesMadeCount = getMovesCount(movesListBoxClass, moveNodeClass, pageType);    }    else{        var movesMadeCount = 0;        }        // get board to get screen position and offsets and also square width    const gameBoard = document.querySelector('.board');    const offsetX = gameBoard.getBoundingClientRect().x;    const offsetY = gameBoard.getBoundingClientRect().y;    const squareWidth = gameBoard.getBoundingClientRect().width / 8;    const bubbles = true;        // dicionário de conversão de casa em coordenadas    var dict = { "a": 1, "b": 2, "c": 3, "d": 4, "e": 5, "f": 6, "g": 7, "h": 8 };        // origin square click    var sourceColumn = source[0];    var sourceRow = source[1];        if (playerColor == "w") {        var clientX = squareWidth * (dict[sourceColumn] - 0.5) + offsetX;        var clientY = squareWidth * (8 + 0.5 - parseInt(sourceRow)) + offsetY;        }    else {        var clientX = squareWidth * (9 - dict[sourceColumn] - 0.5) + offsetX;        var clientY = squareWidth * (- 0.5 + parseInt(sourceRow)) + offsetY;    }        var event = new PointerEvent('pointerdown', { clientX, clientY, bubbles });    gameBoard.dispatchEvent(event);        // destination square click     var destinationColumn = destination[0];    var destinationRow = destination[1];         if (playerColor == "w") {        clientX = squareWidth * (dict[destinationColumn] - 0.5) + offsetX;        clientY = squareWidth * (8 + 0.5 - parseInt(destinationRow)) + offsetY;       }    else {        clientX = squareWidth * (9 - dict[destinationColumn] - 0.5) + offsetX;        clientY = squareWidth * (- 0.5 + parseInt(destinationRow)) + offsetY;       }    event = new PointerEvent('pointerup', { clientX, clientY, bubbles });    document.querySelector('html').dispatchEvent(event);         // check if move is legal    window.setTimeout(function(){         checkForLegalMove(movesListBoxClass, moveNodeClass, pageType, movesMadeCount);    }, 1000);}// Observe if moves list has changedfunction observeMovesMade(movesListBoxClass, moveNodeClass, pageType) {    var movesPlayed = getMovesCount(movesListBoxClass, moveNodeClass, pageType);            if(movesPlayed == 0) {        //The node we need does not exist yet.        //Wait 500ms and try again        window.setTimeout(function(){            observeMovesMade(movesListBoxClass, moveNodeClass, pageType);        }, 500);        return;    }        // Select the node that will be observed for mutations    var targetNode = document.querySelector(movesListBoxClass);        // Options for the observer (which mutations to observe)    var config = {      attributes: false,      childList: true,      subtree: true    };    // Create an observer instance linked to the callback function    var observer = new MutationObserver(callback);        // Start observing the target node for configured mutations    observer.observe(targetNode, config);        // alert that player has made the first move    var lastMoveMadeString = getLastMoveMade(movesListBoxClass, moveNodeClass, pageType);    alert("As Brancas jogaram " + lastMoveMadeString + ", agora as Pretas jogam!");        // In case we are black, we are asked to make our first move    var playerColor = getPlayerColor();    if (playerColor == "b") {        var source = getSourceSquare();        var destination = getDestinationSquare();        makeMove(source, destination, movesListBoxClass, moveNodeClass, pageType);       } }// Callback function to execute when mutations are observedvar callback = function() {    // get classes for elements for functions on different pages    var currentUrl = window.location.href;        // Observe behavior for analysis mode    if (currentUrl.includes("analysis")){        var movesListBoxClass = '.move-list.horizontal-move-list';        var moveNodeClass = '.move-node';        var pageType = "analysis";    }    // Observe behavior for play mode    else if (currentUrl.includes("play")){        var movesListBoxClass = '.layout-move-list.vertical-move-list';        var moveNodeClass = '.move';        var pageType = "play";    }    // get player color    var playerColor = getPlayerColor();    // get moves count    var movesMadeCount = getMovesCount(movesListBoxClass, moveNodeClass, pageType);    // get last move made    var lastMoveMadeString = getLastMoveMade(movesListBoxClass, moveNodeClass, pageType);    // make the alert that move has been played    window.setTimeout(function(){        if (movesMadeCount %2 == 0) {            alert("As Pretas jogaram " + lastMoveMadeString + ", agora as Brancas jogam!");            if (playerColor == "w") {                var source = getSourceSquare();                var destination = getDestinationSquare();                makeMove(source, destination, movesListBoxClass, moveNodeClass, pageType);               }        }        else{            alert("As Brancas jogaram " + lastMoveMadeString + ", agora as Pretas jogam!");            if (playerColor == "b") {                var source = getSourceSquare();                var destination = getDestinationSquare();                makeMove(source, destination, movesListBoxClass, moveNodeClass, pageType);               }        }    }, 500);};// enable Freedom Chess Modefunction enableFreedomMode(movesListBoxClass, moveNodeClass, pageType) {    // enableMouseCoordinatesDebug();        // get player color    var playerColor = getPlayerColor();        getMovesCount(movesListBoxClass, moveNodeClass, pageType);        // first move    if (playerColor == "w"){        var source = getSourceSquare();        var destination = getDestinationSquare();        // validate source and destination squares        var validateInputs = validateSourceAndDestinationSquares(source, destination);        if (validateInputs == false) {            return;        }        else {            makeMove(source, destination, movesListBoxClass, moveNodeClass, pageType);        }    }        // observe if any move has been made    observeMovesMade(movesListBoxClass, moveNodeClass, pageType);    }    