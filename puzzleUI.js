var gameOn = true;
class puz {
    constructor(arr, step, sc) {
      this.arr= arr;
      this.step = step;
      this.sc = sc;
    }
  }

function getStatus() {
    var arr = Array(16);
    for (var i = 0; i < 16; i++) 
        arr[i] = parseInt($(".picture[position=" + i + "]").attr("block"));
    return arr;
}

function logStatus() {
    var arr = getStatus();
    arr.push(arr[0]);
    for (var i = 0; i < 4; i++)
        console.log("%d %d %d %d", arr[4 * i + 1],arr[4 * i + 2],
        arr[4 * i + 3],arr[4 * i + 4]);
    console.log("\n");
}

// 0 10 11 9 7 4 15 14 1 12 2 6 8 3 13 5
function setStatus(arr) {
    for (var i = 0; i < 16; i++) 
        $(".picture[position=" + i + "]").attr("block", arr[i]);
    
}
function puz_cmp(a, b){
    if (a.sc > b.sc) return -1;
    if (a.sc < b.sc) return 1;
    return 0;
}
function getDist(arr){
    var res = 0;
    var N = 4;
    var n = N * N;
    for (var i = 0; i < n; i++)
    {
        if (arr[i] != 0){
            var j = arr[i];
            var ii = i;
            var jj = j;
            if (ii == 0) ii = 16;
            if (jj == 0) jj = 16;
            ii--;
            jj--;
            res += Math.abs((i + 15) % 4 - (j + 15) % 4) + Math.abs(Math.floor(ii / 4) - Math.floor(jj / 4));
        }
    }
    return res;
}
var lambda = 5;
function toStr(arr){
    var res = "";
    if (!arr) return res;
    for (var i = 0; i < arr.length; i++)
        res += String.fromCharCode(65 + arr[i]);
    return res;
}
function isArraySolved(arr) {
    var N = 4;
    var n = N * N;
    for (var i = 0; i < 16; i++) if (i != arr[i]) return false;
    return true;
}
function getSolution(arr){
    var solution = [];
    var N = 4;
    if (isArraySolved(arr)) return [0, 0];
    if (isSolvable(N, arr)){
        var set = buckets.Set(toStr);
        var map = buckets.Dictionary(toStr);

        var que = buckets.PriorityQueue(puz_cmp);
        set.add(arr);
        map.set(arr, null);
        que.add(new puz(arr, 0 ,lambda * getDist(arr)));
        var ansArr = null;
        var getAns = false;
        while(que.size() > 0 && !getAns){
            var ne = que.dequeue();
            var arr = ne.arr;
            var moves = getMove(arr);
            for (var i = 0; i < moves.length; i++){
                var newArr = arrMove(arr, moves[i]);
                if (!set.contains(newArr)){
                    set.add(newArr);
                    map.set(newArr, moves[i]);
                    if (isArraySolved(newArr)){
                        getAns = true;
                        ansArr = newArr;
                        break;
                    }
                    que.add(new puz(newArr, ne.step + 1,
                            ne.step + 1 +
                             lambda * getDist(newArr)));
                }
            }
            if (que.size() % 100 == 0)console.log("%d\n", que.size());
        }
        var res = [];
        while (map.get(ansArr) != null)
        {
            var move = map.get(ansArr);
            res.push(move);
            ansArr = arrMove(ansArr, move);
        }
        que.clear();
        map.clear();
        set.clear();
        return res; 
    }
    else return null;
}


function autoSolver(){
    if (isSolved()) return;
    var arr = Array(16);
    for (var i = 0; i < 16; i++)
        arr[i] = parseInt($(".picture[position=" + i + "]").attr("block"));
    if (isSolvable(4 ,arr))
    {
        gameOn = false;
        
        var time_start = $.now();

        var solution = getSolution(arr);
        var time_end = $.now();
        
        console.log("%d", time_end - time_start);
        if (solution == null) return;
        var autoButton = $("#auto");
        var stepRemain = solution.length;
        
        var timer = setInterval(function(){
            stepRemain--;
            if (stepRemain < 0) {
                clearInterval(timer);
                autoButton.html("自动");
            }
            else {
                pictureMove(solution[stepRemain]);
                autoButton.html("自动("+(stepRemain+1)+")");
                //logStatus();
            }
        }, 150);
        gameOn = true;

    }
}




function arrMove(arr, move){
    var resArr = arr.slice();
    var t = resArr[move[0]];
    resArr[move[0]] = resArr[move[1]];
    resArr[move[1]] = t;
    return resArr;
}

function pictureMove(move) {
    var a = $(".picture[position=" + move[0] +"]");
    var b = $(".picture[position=" + move[1] +"]");
    a.attr("position", move[1]);
    b.attr("position", move[0]);
}

function getMove(arr){
    var N = 4;
    var n = N * N;
    for (var i = 0; i < n; i++){
        if (arr[i] == 0){
            var res = [];
            var p = i;
            if (p == 0) p = 16;
            if (p > 4)      res.push([i, p - 4]);
            if (p <= 12)    res.push([i, (p + 4) % 16]);
            if (p % 4 != 0) res.push([i, (p + 1) % 16]);
            if (p % 4 != 1) res.push([i, (p + 15) % 16]);
            return res;
        }
    }
}

var isSolvable = function(N, arr){
    var val = 0;
    var n = N * N;
    var b = arr.slice();
    b.push(b[0]);
    for (var i = 1; i <= n; i++)
    for (var j = i + 1; j <= n; j++)
        if (b[i] > b[j]) val++;
    for (var i = 1; i <= n; i++){
        if (b[i] == 0){
            val += ((i - 1)% 4) + Math.floor((i - 1)/ 4);
            break;
        }
    }
    if (val % 2 == (N + 1) % 2) return true; 
    return false;
}
// [0, n) random Permutation
var getRandomPermutation = function(n) {
    var numberToSelect = Array(n - 1);

    for (var i = 1; i < n; i++) numberToSelect[i - 1] = i;
    
    var arr = Array(n);
    arr[0] = 0;
    for (var i = 1; i < n; i++)
    {
        arr[i] = numberToSelect.splice(Math.floor(Math.random() * numberToSelect.length), 1)[0];
    }
    return arr;
}
function create_panel() {
    var panel = $("#panel");
    for (var i = 0; i < 16; i++) {
        var ImgBlock = $("<div></div>").addClass("picture").attr("position", i).attr("block", i);
        ImgBlock.attr("draggable","true");
        panel.append(ImgBlock);
    }
}

function record() {
    var arr = Array(16);
    for (var i = 0; i < 16; i++)
    {
        arr[i] = $(".picture[position=" + i + "]").attr("block");
    }
    var str = "";
    for (var i = 1; i <= 16; i++){
        var j = i % 16;
        str += arr[j] + " ";
        if (i % 4 == 0) str += "\n";
    }
    console.log(str);
}

function randomShuffle() {
    while (true){
        var arr = getRandomPermutation(16);
        if (isSolvable(4, arr)){
            for (var i = 0; i < 16; i++){
                $(".picture[position=" + i + "]").attr("block", arr[i]);
            }
            break;
        }
    }
}

function isSolved(){
    for (var i = 0; i < 16; i++)
    {
        if ($(".picture[position=" + i + "]").attr("block") != i) return false;
    }
    return true;
}

function dist(a, b)
{
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function isAdjacent (x, y){
    if (x == y) return false;
    if (x == 0) x = 16;
    else if (y == 0) y = 16;
    if (Math.abs(x - y) == 4) return true;
    if (x > y){
        var t = x;
        x = y;
        y = t;
    }
    if (x + 1 == y && x % 4 != 0) return true;
    return false;
}
$(function(){

    create_panel();
    function addClickEvent(i){
        $(".picture[position=" + i + "]").click(function(event){
            var blk = parseInt(this.getAttribute("block"));
            var i = parseInt(this.getAttribute("position"));
            if (blk != 0){
                var zero_pos = parseInt($(".picture[block=0]").attr("position"));
                
                if (isAdjacent(i, zero_pos)){
                    $(".picture[block=" + blk +"]").attr("position", zero_pos);
                    $(".picture[block=0]").attr("position", i);
 
                    console.log($(".picture[block=" + blk +"]").attr("position"));
 
                    console.log($(".picture[block=0]").attr("position"));
                    console.log("\n");
                    record();
                    console.log("\n");

                    if (isSolved()){
                        if (gameOn) alert("恭喜，拼图完成！");
                    }
                }
            }
        });
    }
    for (var i = 0; i < 16; i++){
        addClickEvent(i);
    }
    $("#restart").click (function(){
        gameOn = true;
        randomShuffle();
    });
    $("#auto").click(autoSolver);
    $(window).keydown( function(event){
        if(gameOn){
            if(event.which >= 37 && event.which <= 40){// left
                var N = 4;
                if (event.which == 37){
                    var ImgBlock0 = $(".picture[block=0]");
                    var pos0 = parseInt(ImgBlock0.attr("position"));
                    if (pos0 % N != 0){
                        var pos1 = (pos0 + 1) % 16;
                        var ImgBlock1 = $(".picture[position=" + pos1 + "]");
                        ImgBlock0.attr("position", pos1);
                        ImgBlock1.attr("position", pos0);
                    }
                }
                else if (event.which == 38){
                    var ImgBlock0 = $(".picture[block=0]");
                    var pos0 = parseInt(ImgBlock0.attr("position"));
                    if (pos0 != 0 && pos0 <= 12){
                        var pos1 = (pos0 + 4) % 16;
                        var ImgBlock1 = $(".picture[position=" + pos1 + "]");
                        ImgBlock0.attr("position", pos1);
                        ImgBlock1.attr("position", pos0);
                    }
                }
                else if (event.which == 39){
                    var ImgBlock0 = $(".picture[block=0]");
                    var pos0 = parseInt(ImgBlock0.attr("position"));
                    if (pos0 % N != 1){
                        var pos1 = (pos0 + 15) % 16;
                        var ImgBlock1 = $(".picture[position=" + pos1 + "]");
                        ImgBlock0.attr("position", pos1);
                        ImgBlock1.attr("position", pos0);
                    }
                }
                else if (event.which == 40){
                    var ImgBlock0 = $(".picture[block=0]");
                    var pos0 = parseInt(ImgBlock0.attr("position"));
                    if (pos0 == 0 || pos0 > 4){
                        var pos1 = (pos0 + 12) % 16;
                        var ImgBlock1 = $(".picture[position=" + pos1 + "]");
                        ImgBlock0.attr("position", pos1);
                        ImgBlock1.attr("position", pos0);
                    }
                }
            }
        }
    });
});