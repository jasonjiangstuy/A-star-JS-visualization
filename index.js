$(document).ready(function(){
    console.log("start");
    initial();
    eventListeners();
})

var canvas = document.getElementById("a-StarCanvas");
var ctx;
var imageData;
var StartData;
var holdPoints;
function eventListeners(){
    // if click on the dots
    var startLine = false;
    var startingPoint;
    var sX, sY;
    // var keepLoop = true;
    
    $("#a-StarCanvas").click(function(evt){
        // console.log("touched")
        var mousex, mousey;
        var hold = getMousePos(canvas, evt);
        mousex = hold[0] - 10;
        mousey = hold[1] - 10;
        var i, x;
        var found = false;
        for (i = 0; i < masterPoint.length; i++){
            for(x = 0; x < masterPoint[i].length; x++){
                if (masterPoint[i][x].clickedOn(mousex, mousey,30)){
                    found = true;
                    break;
                }
            }
            if (found){
                break;
            }
        }
        if (found){
            console.log("found point")
            if (startLine){
                if (1 == Math.abs(sX - x) + Math.abs(sY - i)){
                    console.log("set ending point to " + x, i)
                    startingPoint.activate();
                    startingPoint.addConnection("" + x + i, masterPoint[i][x]);
                    masterPoint[i][x].activate()
                    masterPoint[i][x].addConnection("" +sX +sY, startingPoint);
                    ctx.beginPath();
                    ctx.moveTo(masterPoint[i][x].x, masterPoint[i][x].y);
                    ctx.lineTo(startingPoint.x, startingPoint.y);
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = "pink";
                    ctx.stroke();
                    // keepLoop = false;
                }
                else{
                    // console.log(Math.abs(sX - x) + Math.abs(sY - i))
                    // console.log((sX - x) + Math.abs(sY - i))
                    // console.log(Math.abs(sX - x))
                    // console.log(sY )


                    console.log("point selected is not ajacent to the starting point");
                }
                startLine = false;
            }
            else{
                console.log("set starting point to " + x, i)
                startLine = true;
                // keepLoop = true;

                startingPoint = masterPoint[i][x];
                sY= i;
                sX =x;

                // // save the state of  the canvas here // need async function // extra - comeback
                
                // while (keepLoop == true){
                // // show a line connecting the curser to the connected point
                //     hold = getMousePos(canvas, evt);
                //     mousex = hold[0] - 10;
                //     mousey = hold[1] - 10;

                // ctx.beginPath();
                // ctx.moveTo(startingPoint.x, startingPoint.y);
                // ctx.lineTo(mousex, mousey);
                // ctx.lineWidth = 5;
                // ctx.strokeStyle = "pink";
                // ctx.stroke();

                //     setTimeout(function () {
                //         // return the canvas to the state befor 
                //         ctx.putImageData(imageData, 0, 0);
                //     }, 1000);
                // }
            }
            
        }
    });
    $("#test-button").click(function(evt){
        imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        // save points
        holdPoints = copyMasterPoint(); 
        // save the walls in case we want to use it later
        masterQuene = [];
        // console.log(masterPoint)
        search(masterSquare[0][0]);
        console.log("found?: " + found);
        
        if (found){
            retrace();
        }
    })
    $("#reset-button").click(function(evt){
        //clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(StartData, 0, 0);
        // reset points and squares list
        myPoints();
        mySquare();
    })
    $("#reset-walls").click(function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
        masterPoint = holdPoints; 
        mySquare();
    })
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left,
      evt.clientY - rect.top]
    ;
}
class Square {
    // x, y E [0, 5]
    constructor(x, y, distance){
        this.x = x;
        this.y = y;
        this.active = true;
        this.distanceFromTarget = 10 - (x + y);
        this.cost;
        this.parent;
        // this.distance = distance;
        this.xCoord = (distance) * (x + .5);
        this.yCoord = (distance) * (y + .5);
    }

    deactivate() {
        this.active = false;
    }

    setParent(x){
        this.parent = x;
    }

    
    // find the squares that next to this one and is active
    findNearbyActiveSquares(){
        const test = 1.001;
        let list = masterSquare;
        let plist = masterPoint;
        let myReturnList = [];
        let squareCost = this.cost + 1;
        // console.log("cost: "+ Number(squareCost))
        //check square to the left
        if (this.x > 0){
            if (list[this.y][this.x - 1].active){
                if (!(list[this.y][this.x - 1].cost <= squareCost)){
                    if (!((""+ this.x + (this.y + 1)) in plist[this.y][this.x].listOfConnectedPoints)){
                        list[this.y][this.x - 1].setParent(this);
                        myReturnList.push([list[this.y][this.x - 1], squareCost + list[this.y][this.x - 1].distanceFromTarget * test]);
                        list[this.y][this.x - 1].setCost(squareCost);
                    }
                }

            }
        }
        // check square above
        if (this.y > 0){
            if (list[this.y - 1][this.x].active){
                if (!(list[this.y - 1][this.x].cost <= squareCost)){ // if this new cost to get to the square is less then or a new cost to get to the square
                    if (!((""+ this.x + (this.y)) in plist[this.y][this.x + 1].listOfConnectedPoints)){
                        list[this.y - 1][this.x].setParent(this);
                        myReturnList.push([list[this.y - 1][this.x], squareCost + list[this.y - 1][this.x].distanceFromTarget * test]);
                        list[this.y - 1][this.x].setCost(squareCost);
                    }
                }
            }
        }
        //check square to the right
        if (this.x < 5){
            if (list[this.y][this.x + 1].active){
                if (!(list[this.y][this.x + 1].cost <= squareCost)){
                    if (!((""+ (this.x + 1)+ (this.y + 1)) in plist[this.y][this.x + 1].listOfConnectedPoints)){
                        list[this.y][this.x + 1].setParent(this);
                        myReturnList.push([list[this.y][this.x + 1], squareCost + list[this.y][this.x + 1].distanceFromTarget * test]);
                        list[this.y][this.x + 1].setCost(squareCost);
                    }
                }
            }
        }
        // check square below
        if (this.y < 5){
            if (list[this.y + 1][this.x].active){
                if (!(list[this.y + 1][this.x].cost <= squareCost)){
                    if (!((""+ this.x+ (this.y + 1)) in plist[this.y + 1][this.x + 1].listOfConnectedPoints)){
                        list[this.y + 1][this.x].setParent(this);
                        list[this.y + 1][this.x].setCost(squareCost);
                        myReturnList.push([list[this.y + 1][this.x], squareCost + list[this.y + 1][this.x].distanceFromTarget * test]);
                    }
                }
            }
        }
        // console.log("return list: " + myReturnList)
        return myReturnList;
    }
    setCost(cost){
        this.cost = cost
    }


}
// square, cost to get there
var masterQuene;
var found;
// run this on each item in the quene
var count = 0;
function search(square, rank=0){ 
    // console.log("");    
    // console.log("count:" + count);
    // console.log("rank: " + rank)
    // console.log(square)
    // console.log(square.x, square.y);
    count ++;
    masterQuene.shift();// pop off 1 items from the quene

    if (square.active){
        square.deactivate();
        // draw line
        if ((square.x + square.y) != 0){
            ctx.beginPath();
            ctx.moveTo(square.xCoord, square.yCoord);
            ctx.lineTo(square.parent.xCoord, square.parent.yCoord);
            ctx.lineWidth = 8;
            ctx.strokeStyle = "orange";
            ctx.stroke();
            }
        else{
            square.setCost(0);
        }
        masterQuene.push.apply(masterQuene, square.findNearbyActiveSquares()); // addd to the master quene
        masterQuene.sort(compareFunction);
        var stringMasterQ = "";
        for (var i = 0; i < masterQuene.length; i++){
            stringMasterQ += "[" +masterQuene[i][0].x +"," + masterQuene[i][0].y+", Ranking: "+masterQuene[i][1]+", DistanceFromTarget: "+masterQuene[i][0].distanceFromTarget+", Cost: "+masterQuene[i][0].cost+"]" + ",";
        }
        // console.log("quene length: "+ stringMasterQ)
    }
    if (square.x == 5 && square.y == 5){
        // stop everythign
        found = true;
        return true;
    }
    if (masterQuene.length > 0){
        search(masterQuene[0][0], masterQuene[0][1]);
    }
    else{
        found = false;
        return false;
    }
    
}

function retrace(){
    for (var i = 0; i < masterSquare.length; i++){
        // draw line from current coord to their parent 
        for (var x = 0; x < masterSquare[i].length; x++){
            if ((!masterSquare[i][x].active) && !(masterSquare[i][x].x + masterSquare[i][x].y == 0)){
                ctx.beginPath();
                ctx.moveTo(masterSquare[i][x].xCoord, masterSquare[i][x].yCoord);
                ctx.lineTo(masterSquare[i][x].parent.xCoord, masterSquare[i][x].parent.yCoord);
                ctx.lineWidth = 8;
                ctx.strokeStyle = "orange";
                ctx.stroke();
            }
        }

        
    }
    var target = masterSquare[5][5];
    while (target.x + target.y != 0){
        ctx.beginPath();
        ctx.moveTo(target.xCoord, target.yCoord);
        ctx.lineTo(target.parent.xCoord, target.parent.yCoord);
        ctx.lineWidth = 10;
        ctx.strokeStyle = "green";
        ctx.stroke();
        target= target.parent
    }
}
function compareFunction(a, b){
    return (a[1]) - (b[1]) ;
}

function copyMasterPoint(){
    var newArray = [];
    for (var i = 0; i< masterPoint.length; i ++){
        // create new row
        newArray.push([])
        for (var x = 0; x< 7; x ++){
            newArray[i].push(masterPoint[i][x].clone());
        }
    }
    return newArray;
}

class Point{
   // x, y E [0, 6]
    constructor(x, y){

        this.x = x;
        this.y = y;
        this.active = false;
        this.connectedTo = [];
        this.listOfConnectedPoints ={};

    }

    activate() {
        this.active = true;
    }
    // dictionary that holds the XY key and point object as the value
    addConnection(xy, point){
        if (!(xy in this.listOfConnectedPoints)){
            
            this.listOfConnectedPoints[xy] = point; 
            // console.log(this.listOfConnectedPoints)
        }
        else{
            console.log("already in the dict")
        }
    }
    clickedOn(mouseX, mouseY, radius){
        if (radius >= Math.sqrt((mouseX - this.x)**2 + (mouseY - this.y)**2)){
            return true;
        }
        else{
            return false;
        }
    }
    clone(){
        var x = new Point(this.x, this.y);
        x.active = this.active;
        x.connectedTo = this.connectedTo;
        x.listOfConnectedPoints = Object.assign({}, this.listOfConnectedPoints);
        return x;
    }

}


var masterPoint;
var masterSquare;
function mySquare(){
    // create a 6 by 6 grid of squares
    masterSquare = [];
    for (var i = 0; i< 6; i ++){
        // create new row
        masterSquare.push([]);
        for (var x = 0; x< 6; x ++){
            // create new square in row
            masterSquare[i].push(new Square(x, i, canvas.clientWidth / 6));
        }
    }

}
//  9 x 9 points grid
function myPoints(){
    masterPoint = [];
    holdy = 0;

    for (var i = 0; i< 7; i ++){
        var holdx = 0;
        // create new row
        masterPoint.push([])
        for (var x = 0; x< 7; x ++){
            // create new point in row
            masterPoint[i].push(new Point(holdx, holdy));

            holdx += canvas.clientWidth / 6;  
        }
        holdy += canvas.clientHeight / 6;

        
    }
}

// create the 7 by 7 grid
function my7x7(){
    canvas = document.getElementById("a-StarCanvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    holdy = 0;
    ctx.beginPath();
    ctx.font = "30px Arial";
    ctx.fillText("A",25,50)
    for (var i = 0; i< 7; i ++){
        var holdx = 0;
        for (var x = 0; x< 7; x ++){
            // draw the point
            ctx.beginPath();
            ctx.arc(holdx, holdy, 10, 0, 2 * Math.PI);
            ctx.fill();
            holdx += canvas.clientWidth / 6;  
        }
        holdy += canvas.clientHeight / 6;

        
    }
    
    ctx.beginPath();
    ctx.font = "30px Arial";
    ctx.fillText("B",holdx - canvas.clientWidth / 6 -50, holdy - 100)
    StartData = ctx.getImageData(0,0,canvas.width,canvas.height);
    imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    // console.log(masterSquare)
    // console.log(masterPoint)
    // ctx.fillRect(0, 0, 150, 75); 
}


function initial(){
    // create the 7 by 7 grid
    my7x7();
    // create list of squares
    mySquare();
    // create list of points for barriers
    myPoints();

    // make the hold list have the initial points array
    holdPoints = copyMasterPoint();
    


}