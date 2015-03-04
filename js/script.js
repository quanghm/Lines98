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
	return ($("#"+object).data("color") == 0);
}
function getNbhd(sCellID){
	var aCord;
	
	
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
	// auxiliary functions
	
	// basic variables
	// distances to target
	var aDistToTarget = [];
	
	// unvisited cells
	var aUnvisitedCells =[];
	
	// temp variables
	var x,y,sCurrentCell;
	var nMinDistToTarget=0;
	
	// initialization
	for (x=0;x<8;x++){
		for (y=0;y<8;y++){
			sCurrentCell = Cord2ID(x,y);
			
			if (isEmpty(sCurrentCell)){
				aDistToTarget[sCurrentCell]=(sTargetCellID==sCurrentCell)?0:20;
				aUnvisitedCells.push();
				$("#"+sCurrentCell).addClass("open");
			}
		}
	}
	// end intialization
	
	while (aUnvisitedCells.length>0){
		// find shortest distance
		nMinDistToTarget=Math.min.apply(Math,aDistToTarget);
		
		// current cell ID
		sCurrentCell=$.inArray(nMinDistToTarget,aDistToTarget);
		
		
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}
