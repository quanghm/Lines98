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

function isEmpty(object) {
	return (object.data("color") == 0);
}

function selectCell(element) {
	var oSelectedElement = $(element);
	var sSelectedID = oSelectedElement.attr("id");

	// if element is non-empty
	if (!isEmpty(oSelectedElement)) {
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
		if ((isEmpty(oSelectedElement)) && (sSourceCellID !== "")) {
			if (findPath(sSourceCellID, sSelectedID)) {
				alert("found");
				// move(sSourceCellID, sSelectedID);
			}
		}
	}
}

function findPath(sSourceCellID, sTargetCellID) {

	// list of open cells
	var aOpenCellIDs = [ sTargetCellID ];

	// tracking next cell
	var aNextCellIDs = [];

	// working Cell ID
	var sWorkingCellID = "";

	// distance to target
	var aDistToTarget = [];
	for (x = 0; x < 9; x++) {
		for (y = 0; y < 9; y++) {
			sWorkingCellID = Cord2ID(x, y);
			aDistToTarget[sWorkingCellID] = 20;
			aNextCellIDs[sWorkingCellID] = "";
		}
	}
	aDistToTarget[sTargetCellID] = 0;

	function move(sSourceCellID, sTargetCellID) {
		var sNextID = sSourceCellID;
		var oCurrentCell;

		alert(sNextID);

		while (sNextID !== sTargetCellID) {
			// move out
			toggleActive($("#" + sNextID));
			// get next ID
			sNextID = aNextCellIDs[sNextID];
			// move in
			toggleActive($("#" + sNextID));
		}
	}

	// function insert ID to list of open cells
	function insertID(sCellID) {
		var nOpenCellCount = aOpenCellIDs.length;
		var nKey = -0;

		if (nOpenCellCount == 0) {
			aOpenCellIDs.push(sCellID);
		} else {
			// check if sCellID is already open
			nKey = $.inArray(sCellID, aOpenCellIDs);
			if (nKey > -1) {
				aOpenCellIDs.splice(nKey, 1);
			}
			nKey = -1;
			do {
				nKey++;
			} while ((aDistToTarget[sCellID] > aDistToTarget[aOpenCellIDs[nKey]])
					&& (nKey < nOpenCellCount));
			aOpenCellIDs.splice(nKey, 0, sCellID);
		}
		$("#" + sCellID).addClass("open");
	}

	// while there are open cells
	var sCurrentID = "";
	var aCurrentCord = [];

	// Previous cell info
	var nPrevX = 0;
	var nPrevY = 0;
	var sPrevID = "";
	var oPrevCell;

	while (aOpenCellIDs.length > 0) {
		sCurrentID = aOpenCellIDs[0];
		aCurrentCord = ID2Cord(sCurrentID);

		$("#" + sCurrentID).toggleClass("current");

		// look at neighborhood
		// look up
		if (aCurrentCord[0] > 0) {

			nPrevX = aCurrentCord[0] - 1;
			nPrevY = aCurrentCord[1];
			sPrevID = Cord2ID(nPrevX, nPrevY);

			oPrevCell = $("#" + sPrevID);
			// if this is empty cell
			if ((isEmpty(oPrevCell)) || (sPrevID == sSourceCellID)) {
				// update distance to Target of Previous Cell
				if (aDistToTarget[sPrevID] > aDistToTarget[sCurrentID]) {
					aDistToTarget[sPrevID] = aDistToTarget[sCurrentID] + 1;
					oPrevCell.html(aDistToTarget[sPrevID]);
					aNextCellIDs[sPrevID] = sCurrentID;
				}

				// if we found the source
				if (sPrevID == sSourceCellID) {
					return true;
				}

				insertID(sPrevID);
			}
		}

		// look down
		if (aCurrentCord[0] < 8) {
			nPrevX = aCurrentCord[0] + 1;
			nPrevY = aCurrentCord[1];
			sPrevID = nPrevX + "_" + nPrevY;

			oPrevCell = $("#" + sPrevID);
			// if this is empty cell
			if ((isEmpty(oPrevCell)) || (sPrevID == sSourceCellID)) {
				// update distance to Target of Previous Cell
				if (aDistToTarget[sPrevID] > aDistToTarget[sCurrentID]) {
					aDistToTarget[sPrevID] = aDistToTarget[sCurrentID] + 1;
					oPrevCell.html(aDistToTarget[sPrevID]);
					aNextCellIDs[sPrevID] = sCurrentID;
				}

				// if we found the source
				if (sPrevID == sSourceCellID) {
					return true;
				}

				insertID(sPrevID);
			}
		}

		// look left
		if (aCurrentCord[1] > 0) {
			nPrevX = aCurrentCord[0];
			nPrevY = aCurrentCord[1] - 1;
			sPrevID = nPrevX + "_" + nPrevY;

			oPrevCell = $("#" + sPrevID);
			// if this is empty cell
			if ((isEmpty(oPrevCell)) || (sPrevID == sSourceCellID)) {
				// update distance to Target of Previous Cell
				if (aDistToTarget[sPrevID] > aDistToTarget[sCurrentID]) {
					aDistToTarget[sPrevID] = aDistToTarget[sCurrentID] + 1;
					oPrevCell.html(aDistToTarget[sPrevID]);
					aNextCellIDs[sPrevID] = sCurrentID;
				}

				// if we found the source
				if (sPrevID == sSourceCellID) {
					return true;
				} else {
					insertID(sPrevID);
				}
			}
		}

		// look right
		if (aCurrentCord[1] < 8) {
			nPrevX = aCurrentCord[0];
			nPrevY = aCurrentCord[1] + 1;
			sPrevID = nPrevX + "_" + nPrevY;

			oPrevCell = $("#" + sPrevID);
			// if this is empty cell
			if ((isEmpty(oPrevCell)) || (sPrevID == sSourceCellID)) {
				// update distance to Target of Previous Cell
				if (aDistToTarget[sPrevID] > aDistToTarget[sCurrentID]) {
					aDistToTarget[sPrevID] = aDistToTarget[sCurrentID] + 1;
					oPrevCell.html(aDistToTarget[sPrevID]);
					aNextCellIDs[sPrevID] = sCurrentID;
				}

				// if we found the source
				if (sPrevID == sSourceCellID) {
					return true;
				} else {
					insertID(sPrevID);
				}
			}
		}
		$("#" + sCurrentID).toggleClass("current");		
		aOpenCellIDs.splice(0, 1);
	}

	// no more open cells, cannot reach Source
	return false;
}
