var sSourceCellID = "";

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

function resetGame() {
	// reset score

	// erase SourceCellID
	sSourceCellID = "";
	// reset board
	$("#gameBoard").empty();
	var newDiv;
	var newDivColor;

	for (x = 0; x < 9; x++) {
		for (y = 0; y < 9; y++) {
			newDivColor = Math.floor(Math.random() * 1.9);

			newDiv = $("<div/>", {
				class : "boardCell",
				id : Cord2ID(x, y),
				html : (newDivColor > 0) ? "x" : "0",
				onclick : "selectCell(this);"
			});

			// newDiv.data("X", x);
			// newDiv.data("Y", y);

			newDiv.data("nextX", 0);
			newDiv.data("nextY", 0);
			newDiv.data("disToTarget", 20);
			newDiv.data("color", newDivColor);

			newDiv.appendTo($("#gameBoard"));
		}
	}

	// randomize 4 cells
}
function ID2Cord(sCellID) {
	return sCellID.split("_");
}

function Cord2ID(x, y) {
	return (x + "_" + y);
}

function toggleActive(object) {
	object.toggleClass("active");
}

function isEmpty(sCellID) {
	return ($("#" + sCellID).data("color") === 0);
}
function getNbhd(sCellID) {
	var aCord = ID2Cord(sCellID);
	var aNbhdIDs = {};

	var nbhdX, nbhdY;
	var sNbhdID;

	// left neighbor
	if (aCord[1] > 0) {
		sNbhdID = Cord2ID(aCord[0], aCord[1] - 1);
		aNbhdIDs["l"] = sNbhdID;
	}

	// right neighbor
	if (aCord[1] < 8) {
		sNbhdID = Cord2ID(aCord[0], aCord[1] - 0 + 1);
		aNbhdIDs["r"] = sNbhdID;
	}

	// up neighbor
	if (aCord[0] > 0) {
		sNbhdID = Cord2ID(aCord[0] - 1, aCord[1]);
		aNbhdIDs["u"] = sNbhdID;
	}
	// down neighbor
	if (aCord[0] < 8) {
		sNbhdID = Cord2ID(aCord[0] - 0 + 1, aCord[1]);
		aNbhdIDs["d"] = sNbhdID;
	}

	// debug
	console.log(aNbhdIDs);
	return aNbhdIDs;
}
function selectCell(element) {
	var oSelectedElement = $(element);
	var sSelectedID = oSelectedElement.attr("id");

	// if element is non-empty
	if (!isEmpty(sSelectedID)) {
		// if element is active
		if (sSelectedID == sSourceCellID) {
			// deactivate
			toggleActive(oSelectedElement)
			// erase Source
			sSourceCellID = "";

			// exit function
			return 0;
		}
		// if element is not active
		// activate element
		toggleActive(oSelectedElement);

		// if source exists
		if (sSourceCellID !== "") {

			// deactivate source
			toggleActive($("#" + sSourceCellID));
		}

		// update source's ID
		sSourceCellID = sSelectedID;
		return 0;
	} else { // if element is empty and source exists
		if ((isEmpty(sSelectedID)) && (sSourceCellID !== "")) {
			if (findPath(sSourceCellID, sSelectedID)) {
				console.log("found");
				// move(sSourceCellID, sSelectedID);
			}
		}
	}
}

function findPath(sSourceCellID, sTargetCellID) {

	// basic variables
	var pathFound = false;

	// unvisited cells
	var aUnvisitedCells = [];

	// save all the (empty) cells
	var aAllCells = {};
	// distant to Target
	// var aAllCellsID = {};

	// temp variables
	var x, y, sCurrentCellID;
	var nMinDistToTarget = 0;

	// number of open cells
	var nUnvisitedCellCount = 0;

	// auxiliary functions

	function sortUnvisitedCells() {
		// sort unvisited cells by increasing distance
		aUnvisitedCells.sort(function(a, b) {
			return a.distToTarget - b.distToTarget;
		});

		// debug
		$("#mainFooter").html(aUnvisitedCells[0].distToTarget);
	}

	function makeMove() {
		var sCurrentCellID = sSourceCellID;
		while (sCurrentCellID !== sTargetCellID) { // Cell isn't target
			// debug
			alert(sCurrentCellID);

			$("#" + sCurrentCellID).html("0");
			$("#" + sCurrentCellID).toggleClass("active");
			sCurrentCellID = aAllCells[sCurrentCellID].nextCellID;
			$("#" + sCurrentCellID).toggleClass("active");
			$("#" + sCurrentCellID).html("x");
			

		}
	}
	// end auxiliary functions

	// initialization
	for (x = 0; x < 9; x++) {
		for (y = 0; y < 9; y++) {
			sCurrentCellID = Cord2ID(x, y);

			if (isEmpty(sCurrentCellID) || (sCurrentCellID == sSourceCellID)) {

				aUnvisitedCells.push({
					id : sCurrentCellID,
					distToTarget : (sCurrentCellID == sTargetCellID) ? 0 : 20,
					nextCellID : ""
				});

				aAllCells[sCurrentCellID] = aUnvisitedCells[nUnvisitedCellCount++];
			}
		}
	}
	sortUnvisitedCells();

	// init Unvisited cells
	// aUnvisitedCells.push({
	// id : sTargetCellID,
	// nextID : "",
	// nDistToTarget : 0
	// });
	// nOpenCellCount++;
	// end intialization

	var oCurrentCell, sNextCellID, tempDist;
	var aNbhdIDs;
	while (nUnvisitedCellCount > 0) {
		oCurrentCell = aUnvisitedCells.shift();
		nUnvisitedCellCount--;
		if (oCurrentCell.distToTarget === 20) {
			return false;
		}
		sCurrentCellID = oCurrentCell.id;

		aNbhdIDs = getNbhd(sCurrentCellID);

		$.each(aNbhdIDs, function(direction, sNextCellID) {
			if (sNextCellID === sSourceCellID) {
				aAllCells[sSourceCellID].nextCellID = sCurrentCellID;
				pathFound = true; // found path
				return false;
			}

			tempDist = aAllCells[sCurrentCellID].distToTarget * 1 + 1;
			if (aAllCells[sNextCellID] !== undefined) {
				if (aAllCells[sNextCellID].distToTarget > tempDist) {
					aAllCells[sNextCellID].distToTarget = tempDist;
					aAllCells[sNextCellID].nextCellID = sCurrentCellID;

					// debug
					console.log(sNextCellID + ":" + tempDist);
					$("#" + sNextCellID).html(tempDist);
				}
			}
		});
		if (pathFound) {
			makeMove();
			return true;
		}
		sortUnvisitedCells();
	}
	console.log("not Found");
	return pathFound;

}
