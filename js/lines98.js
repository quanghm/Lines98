//	global variables
var sInitialCellID = ""; // id of intial cell
var sTerminalCellID = ""; // id of terminal cell
var aCellByIDs = [];
var sActiveCellID = "";
var nEmptyCellCount = 0;
var aEmptyCellIDs = [];
var nTotalScore=0;
var aNextBalls = [ {
	id : "nextBall0",
	color : 0
}, {
	id : "nextBall1",
	color : 0
}, {
	id : "nextBall2",
	color : 0
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

	if (nCellColor === 0) { // previously empty
		// remove cell from list of empty cells
		aEmptyCellIDs.splice($.inArray(sCellID, aEmptyCellIDs), 1);
		nEmptyCellCount--;
	}

	oCell.color = nNewColor; // set the new color to cell object

	// $("#" + sCellID).html(nNewColor); //change the cell on game bor
	$("#" + sCellID).css("background-image",
			"url(./images/" + nNewColor + ".png)");
	if (nNewColor === 0) {
		aEmptyCellIDs.push(sCellID);
		nEmptyCellCount++;
	}
}

function newGame() {
	var nNewColor;
	var sNewCellID;

	// reset variables
	nEmptyCellCount = 0;
	sActiveCellID = "";
	aEmptyCellIDs.length = 0;
	nTotalScore = 0;

	// reset all cells
	for (var x = 0; x < 9; x++) {
		for (var y = 0; y < 9; y++) {
			sNewCellID = cord2ID(x, y);

			// debug
			// nNewColor = Math.floor(Math.random() * 6);
			// end debug

			aCellByIDs[sNewCellID] = {
				id : sNewCellID,
				distToTarget : Infinity,
				nextCellID : "",
				color : 0,
				active : false
			};
			if (isEmpty(sNewCellID)) {
				nEmptyCellCount++;
				aEmptyCellIDs.push(sNewCellID);
			}
			console.log(aCellByIDs[sNewCellID]);
			//$("#" + sNewCellID).html(sNewCellID);
		}
	}
	
	// initialize Score
	$("#score").html(nTotalScore);

	// initialize game board with random balls
	getNextBallColors();
	pushNextBallsToBoard();
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

	// debug
	// console.log(aNbhdIDs);
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

	// debug
	// console.log(aUnvisitedCells);
	// done init Unvisited Cells

	while (nOpenCellCount > 0) {
		oCurrentCell = aUnvisitedCells.shift();
		sCurrentCellID = oCurrentCell.id;
		nOpenCellCount--;

		// debug
		// console.log(sCurrentCellID);
		// end debug

		if (aCellByIDs[sCurrentCellID].distToTarget === Infinity) {
			// debug
			console.log("no path found");
			// end debug

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
			console.log("path Found");
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
		nNewColor = Math.floor(Math.random() * 5) + 1; // new color
		setColor(nNewColor, aNextBalls[i]);
	}
}

// put the next balls to board randomly
function pushNextBallsToBoard() {
	var x, y; // random cordinates
	var nNewEmptyCellKey;
	var sNewEmptyCellID;
	for (var i = 0; i < 3; i++) {
		if (nEmptyCellCount === 0) {
			return false;
		}
		// find an empty cell
		nNewEmptyCellKey = Math.floor(Math.random() * nEmptyCellCount);
		sNewEmptyCellID = aEmptyCellIDs[nNewEmptyCellKey];
		// 

		nEmptyCellCount--; // update empty cell count
		aEmptyCellIDs.splice(nNewEmptyCellKey, 1); // delete the (now filled) empty cell out of list.
		setColor(aNextBalls[i].color, aCellByIDs[sNewEmptyCellID]); // set new color, place the ball
		findColorBlocks(sNewEmptyCellID);
	}
	getNextBallColors();
	return true;
}

function makeMove(sSelectedCellID) {
	var sCurrentCellID = sActiveCellID;
	var eProxyDiv = $("<div/>", {
		class : "boardCell",
		id : "proxyDiv",
		color : aCellByIDs[sActiveCellID].color,
	}).appendTo($("#gameBoard"));
	eProxyDiv.css("z-index", "100").css("position", "fixed");

	var aCurrentCord, aNextCord;
	// asign new cell color to terminal cell
	setColor(aCellByIDs[sActiveCellID].color, aCellByIDs[sSelectedCellID]);
	aNextCord = $("#" + sCurrentCellID).position();//
	eProxyDiv.offset(aNextCord); // put proxy cell over intial cell

	while (sCurrentCellID !== sSelectedCellID) { // Cell isn't target
		sCurrentCellID = aCellByIDs[sCurrentCellID].nextCellID;// update next
																// cell
		// get next display coord
		aNextCord = $("#" + sCurrentCellID).offset();
		eProxyDiv.animate(aNextCord); // put proxy over next cell
	}

	// empty initial cell
	setColor(0, aCellByIDs[sActiveCellID]);
	toggleActive(sActiveCellID); // disactivate initial cell
	eProxyDiv.remove();
}

function selectCell(eSelectedCell) {

	var sSelectedCellID = $(eSelectedCell).attr("id");

	if (!isEmpty(sSelectedCellID)) { // selected Cell is not empty
		toggleActive(sSelectedCellID);
	} else { // selected cell is empty
		if (sActiveCellID !== "") { // and there's an active cell
			if (findPath(sSelectedCellID)) {
				makeMove(sSelectedCellID);
				if (!findColorBlocks(sSelectedCellID)) {
					// setNextBallColors();
					pushNextBallsToBoard();
				}
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
	console.log("checking "+sCenterCellID);
	console.log(aThisCord);
	console.log(aDirections);

	
	for (var direction = 0; direction < 4; direction++) {
		aDirectionBlock.length = 0;
		// aDirectionBlock.push(sCenterCellID);
		console.log();
		console.log("direction "+aDirections[direction][0]+","+aDirections[direction][1]);
		
		nStep = 1;
		
		sTempID = cord2ID(aThisCord[0]*1 + aDirections[direction][0] * nStep,
				aThisCord[1]*1	 + aDirections[direction][1] * nStep);
		console.log("step: "+sTempID);
		console.log(aCellByIDs[sTempID]);
		
		while (aCellByIDs[sTempID] !== undefined) {// check next cell color --
													// POSITIVE direction
			console.log("step: "+sTempID);
			if (aCellByIDs[sTempID].color == nThisColor) {
				aDirectionBlock.push(sTempID);
				nStep++;
				sTempID = cord2ID(aThisCord[0]*1 + aDirections[direction][0] * nStep,
						aThisCord[1]*1	 + aDirections[direction][1] * nStep);
			} else {
				break;
			}
		}

		nStep = -1;
		sTempID = cord2ID(aThisCord[0]*1 + aDirections[direction][0] * nStep,
				aThisCord[1]*1	 + aDirections[direction][1] * nStep);
		while ((aCellByIDs[sTempID] != undefined)
				&& (aCellByIDs[sTempID].color == nThisColor)) {// check next
																// cell color --
																// negative
																// direction
			aDirectionBlock.push(sTempID);
			nStep--;
			sTempID = cord2ID(aThisCord[0]*1 + aDirections[direction][0] * nStep,
					aThisCord[1]*1	 + aDirections[direction][1] * nStep);
		}

		console.log('found '+aDirectionBlock);
		
		if (aDirectionBlock.length > 3) { // if more than
			bBlockFound = true;
			aBlockCellIDs.push.apply(aBlockCellIDs, aDirectionBlock);
			console.log(aBlockCellIDs);
		}
	}

	if (bBlockFound) { // if block found, erase it;
		console.log("block found");
		for (var i = 0; i < aBlockCellIDs.length; i++) {
			setColor(0, aCellByIDs[aBlockCellIDs[i]]);
		}
		nTotalScore+= Math.floor(Math.exp(aBlockCellIDs.length*Math.log(1.4)));
		$("#score").html(nTotalScore);
	}
	return bBlockFound;
}


// button functions

$("#menuRefresh").click(function(){
	location.reload();
})