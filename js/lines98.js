//	global variables
var aCellByIDs = [];
var sActiveCellID = "";
var aEmptyCellIDs = [];
var nTotalScore = 0;
var nMaxColor = 7;
var aNextBalls = [ {
	id : "nextBall0",
	color : 1
}, {
	id : "nextBall1",
	color : 1
}, {
	id : "nextBall2",
	color : 1
} ];

function isEmpty(sCellID) {
	return (aCellByIDs[sCellID].color === 0);
}

function cord2ID(x, y) {
	return (x + "_" + y);
}

function id2Cord(sCellID) {
	return sCellID.split("_");
}

function setColor(nNewColor, oCell) {
	var sCellID = oCell.id;
	var nCellColor = oCell.color;

	if ((nNewColor !== nCellColor) && (nCellColor === 0)) { // previously empty
		// remove cell from list of empty cells
		aEmptyCellIDs.splice($.inArray(sCellID, aEmptyCellIDs), 1);
	}

	oCell.color = nNewColor; // set the new color to cell object

	$("#" + sCellID).css("background-image",
			"url(./images/" + nNewColor + ".png)");
	if (nNewColor === 0) {
		aEmptyCellIDs.push(sCellID);
		// nEmptyCellCount++;
	}
}

function newGame(sLoadGame) { // sLoadGame=="load" -> load saved game
	if (sLoadGame === undefined) {
		sLoadGame = "";
	}
	var nNewColor;
	var sNewCellID;

	aCellByIDs.length = 0;
	aEmptyCellIDs.length = 0;
	sActiveCellID = "";

	if (sLoadGame === "load") {

		nTotalScore = window.localStorage.getItem("nTotalScore");
		nMaxColor = window.localStorage.getItem("nMaxColor");

		// load boad
		for (var x = 0; x < 9; x++) {
			for (var y = 0; y < 9; y++) {
				sNewCellID = cord2ID(x, y);

				aCellByIDs[sNewCellID] = JSON.parse(window.localStorage
						.getItem(sNewCellID));

				setColor(aCellByIDs[sNewCellID].color, aCellByIDs[sNewCellID]);
			}
		}

		// // set color
		// for (var x = 0; x < 9; x++) {
		// for (var y = 0; y < 9; y++) {
		// sNewCellID = cord2ID(x, y);
		// setColor(aCellByIDs[sNewCellID].color, aCellByIDs[sNewCellID]);
		// }
		// }

		// set next Ball color
		for (var i = 0; i < 3; i++) {
			aNextBalls[i] = JSON.parse(window.localStorage.getItem("nextBall"
					+ i));
			setColor(aNextBalls[i].color, aNextBalls[i]);
		}

	} else { // reset variables
		nTotalScore = 0;

		// reset all cells
		for (var x = 0; x < 9; x++) {
			for (var y = 0; y < 9; y++) {
				sNewCellID = cord2ID(x, y);

				aCellByIDs[sNewCellID] = {
					id : sNewCellID,
					distToTarget : Infinity,
					nextCellID : "",
					color : 1,
					active : false
				};
				setColor(0, aCellByIDs[sNewCellID]);
			}
		}

		// initialize game board with random balls
		getNextBallColors();
		pushNextBallsToBoard();
	}

	// initialize Score
	$("#score").html(nTotalScore);
}

// get all neghbors of a cell
function getNbhd(sCellID) {
	var aCord = id2Cord(sCellID);
	var aNbhdIDs = {};

	var nbhdX, nbhdY;
	var sNbhdID;

	// left neighbor
	if (aCord[1] > 0) {
		sNbhdID = cord2ID(aCord[0], aCord[1] - 1);
		aNbhdIDs["l"] = sNbhdID;
	}

	// right neighbor
	if (aCord[1] < 8) {
		sNbhdID = cord2ID(aCord[0], aCord[1] - 0 + 1);
		aNbhdIDs["r"] = sNbhdID;
	}

	// up neighbor
	if (aCord[0] > 0) {
		sNbhdID = cord2ID(aCord[0] - 1, aCord[1]);
		aNbhdIDs["u"] = sNbhdID;
	}
	// down neighbor
	if (aCord[0] < 8) {
		sNbhdID = cord2ID(aCord[0] - 0 + 1, aCord[1]);
		aNbhdIDs["d"] = sNbhdID;
	}

	return aNbhdIDs;
}

function toggleActive(sSelectedCellID) {
	// if selected cell is active, deactivate it
	if (sActiveCellID === sSelectedCellID) {
		aCellByIDs[sSelectedCellID].active = false;
		sActiveCellID = "";
		$("#" + sSelectedCellID).toggleClass("active");
	} else {
		// if another cell is active, deactivate it
		if (sActiveCellID !== "") {
			aCellByIDs[sActiveCellID].active = false;
			$("#" + sActiveCellID).toggleClass("active");
		}

		// activate current cell
		aCellByIDs[sSelectedCellID].active = true;
		$("#" + sSelectedCellID).toggleClass("active");
		sActiveCellID = sSelectedCellID;
	}
}

function findPath(sSelectedCellID) {
	var aUnvisitedCells = []; // unvisited cells
	var oCurrentCell = {}; // current cell object
	var sCurrentCellID = ""; // temp variable, current cell ID
	var sNextCellID = ""; // record next cell in queue
	var nOpenCellCount = 0; // number of open cells
	var pathFound = false; // if a path is found
	var aNbhdIDs = {}; // list of neighborhood
	var tempDist = 0; // temporary distance

	// init Unvisited cells
	for (var x = 0; x < 9; x++) {
		for (var y = 0; y < 9; y++) {
			sCurrentCellID = cord2ID(x, y);
			aCellByIDs[sCurrentCellID].distToTarget = (sCurrentCellID === sSelectedCellID) ? 0
					: Infinity;

			if (isEmpty(sCurrentCellID) || (sCurrentCellID === sActiveCellID)) {
				aUnvisitedCells.push(aCellByIDs[sCurrentCellID]);
				nOpenCellCount++;
			}
		}
	}

	// sort unvisited cells by distant
	aUnvisitedCells.sort(function(a, b) {
		return (a.distToTarget - b.distToTarget);
	});

	// done init Unvisited Cells

	while (nOpenCellCount > 0) {
		oCurrentCell = aUnvisitedCells.shift();
		sCurrentCellID = oCurrentCell.id;
		nOpenCellCount--;

		if (aCellByIDs[sCurrentCellID].distToTarget === Infinity) {
			return false; // no path found
		}
		aNbhdIDs = getNbhd(sCurrentCellID);

		$.each(aNbhdIDs, function(direction, sNextCellID) {
			if (sNextCellID === sActiveCellID) {
				aCellByIDs[sActiveCellID].nextCellID = sCurrentCellID;
				pathFound = true; // found path
				return false;
			}

			tempDist = aCellByIDs[sCurrentCellID].distToTarget * 1 + 1;
			if (isEmpty(sCurrentCellID)) {
				if (aCellByIDs[sNextCellID].distToTarget > tempDist) {
					aCellByIDs[sNextCellID].distToTarget = tempDist;
					aCellByIDs[sNextCellID].nextCellID = sCurrentCellID;
				}
			}
		});
		if (pathFound) {
			return true;
		}
		aUnvisitedCells.sort(function(a, b) {
			return (a.distToTarget - b.distToTarget);
		})
	}
}

function getNextBallColors() {
	var nNewColor;
	for (var i = 0; i < 3; i++) {
		nNewColor = Math.floor(Math.random() * nMaxColor) + 1; // new color
		setColor(nNewColor, aNextBalls[i]);
	}
}

// put the next balls to board randomly
function pushNextBallsToBoard() {
	var nNewEmptyCellKey;
	var sNewEmptyCellID;

	for (var i = 0; i < 3; i++) {
		// find an empty cell
		nNewEmptyCellKey = Math.floor(Math.random() * aEmptyCellIDs.length);
		sNewEmptyCellID = aEmptyCellIDs[nNewEmptyCellKey];

		// set new color, place the ball
		setColor(aNextBalls[i].color, aCellByIDs[sNewEmptyCellID]); // 
		findColorBlocks(sNewEmptyCellID);
		if (aEmptyCellIDs.length === 0) {
			alert("game ends");
			newGame();
		}
	}
	getNextBallColors();
	return true;
}

function makeMove(sSelectedCellID) {
	var nNewColor = aCellByIDs[sActiveCellID].color;
	var nMoveTime = 0;
	var nTimePerStep = 60;
	var sCurrentCellID = sActiveCellID;

	var aCurrentCord, aNextCord;
	var aPoints = [];

	// empty initial cell
	setColor(0, aCellByIDs[sActiveCellID]);

	aNextCord = $("#" + sCurrentCellID).offset();//
	var eProxyDiv = $("<div/>", {
		class : "boardCell",
		id : "proxyDiv",
		color : nNewColor,
		visibility : "hidden"
	}).appendTo($("#gameBoard"));

	$(eProxyDiv).css("background-image", "url(./images/" + nNewColor + ".png)") // paint
	// the
	// ball
	.offset(aNextCord) // place on the board
	.css("visibility", "visible"); // show it

	while (sCurrentCellID !== sSelectedCellID) { // Cell isn't target
		sCurrentCellID = aCellByIDs[sCurrentCellID].nextCellID;// update next
		// cell
		// get next display coord
		aNextCord = $("#" + sCurrentCellID).offset();
		eProxyDiv.show();
		eProxyDiv.animate(aNextCord, nTimePerStep); // put proxy over next cell
		nMoveTime += nTimePerStep;
	}

	setTimeout(function() {
		// asign new cell color to terminal cell
		setColor(nNewColor, aCellByIDs[sSelectedCellID]);

		toggleActive(sActiveCellID); // disactivate initial cell
		$("#proxyDiv").remove();

		if (!findColorBlocks(sSelectedCellID)) {
			// setNextBallColors();
			pushNextBallsToBoard();
		}
	}, nMoveTime);
}

function selectCell(eSelectedCell) {

	var sSelectedCellID = $(eSelectedCell).attr("id");

	if (!isEmpty(sSelectedCellID)) { // selected Cell is not empty
		toggleActive(sSelectedCellID);
	} else { // selected cell is empty
		if (sActiveCellID !== "") { // and there's an active cell
			if (findPath(sSelectedCellID)) {
				makeMove(sSelectedCellID);
			}
		}
	}
}

function findColorBlocks(sCenterCellID) { // function to find color blocks
	// around a cell, returns the cells'
	// IDs
	var aBlockCellIDs = [ sCenterCellID ]; // cells found in all direction if
	// eligible
	var aDirectionBlock = []; // cells found in current direction
	var aDirections = [ [ 0, 1 ], [ 1, 0 ], [ 1, 1 ], [ 1, -1 ] ]; // directions
	var nStep = 0;
	var aThisCord = id2Cord(sCenterCellID);
	var nThisColor = aCellByIDs[sCenterCellID].color;
	var sTempID;
	var bBlockFound = false;

	for (var direction = 0; direction < 4; direction++) {
		aDirectionBlock.length = 0;
		nStep = 1;

		sTempID = cord2ID(aThisCord[0] * 1 + aDirections[direction][0] * nStep,
				aThisCord[1] * 1 + aDirections[direction][1] * nStep);

		while (aCellByIDs[sTempID] !== undefined) {// check next cell color --
			// POSITIVE direction
			if (aCellByIDs[sTempID].color == nThisColor) {
				aDirectionBlock.push(sTempID);
				nStep++;
				sTempID = cord2ID(aThisCord[0] * 1 + aDirections[direction][0]
						* nStep, aThisCord[1] * 1 + aDirections[direction][1]
						* nStep);
			} else {
				break;
			}
		}

		nStep = -1;
		sTempID = cord2ID(aThisCord[0] * 1 + aDirections[direction][0] * nStep,
				aThisCord[1] * 1 + aDirections[direction][1] * nStep);
		while ((aCellByIDs[sTempID] != undefined)
				&& (aCellByIDs[sTempID].color == nThisColor)) {// check next
			// cell color --
			// negative
			// direction
			aDirectionBlock.push(sTempID);
			nStep--;
			sTempID = cord2ID(aThisCord[0] * 1 + aDirections[direction][0]
					* nStep, aThisCord[1] * 1 + aDirections[direction][1]
					* nStep);
		}

		if (aDirectionBlock.length > 3) { // if more than
			bBlockFound = true;
			aBlockCellIDs.push.apply(aBlockCellIDs, aDirectionBlock);
		}
	}

	if (bBlockFound) { // if block found, erase it;
		for (var i = 0; i < aBlockCellIDs.length; i++) {
			setColor(0, aCellByIDs[aBlockCellIDs[i]]);
		}
		nTotalScore = nTotalScore * 1
				+ Math.floor(Math.exp(aBlockCellIDs.length * Math.log(1.4)));
		$("#score").html(nTotalScore);
	}
	return bBlockFound;
}

/**
 * Game Functions
 */

// save game to local storage
function saveGame() {
	var sNewCellID;

	// save current board state
	for (var x = 0; x < 9; x++) {
		for (var y = 0; y < 9; y++) {
			sNewCellID = cord2ID(x, y);

			window.localStorage.setItem(sNewCellID, JSON
					.stringify(aCellByIDs[sNewCellID]));
		}
	}
	// save active cell
	// window.localStorage.setItem("sActiveCellID",sActiveCellID);

	// save next balls
	for (var i = 0; i < 3; i++) {
		window.localStorage.setItem("nextBall" + i, JSON
				.stringify(aNextBalls[i]));
	}

	// save total score
	window.localStorage.setItem("nTotalScore", nTotalScore);
	// save game dificulty
	window.localStorage.setItem("nMaxColor", nMaxColor);
}

// button functions

$("#menuRefresh").click(function() {
	location.reload();
})

$("#mainMenuSaveGame").click(function() {
	saveGame();
	alert("game saved");
})
$("#mainMenuLoadGame").click(function() {
	if (confirm("Do you want to cancel this game and load the saved one?")) {
		newGame("load");
	}
})