var canvas;
var ctx;
var audioContext;
var analyser;
var mic;
let flag = false;
let start = document.getElementById("1");
let end = document.getElementById("2");
let guanka = {
    first:[]
};

canvasOne = document.getElementById('canvasOne');
ctx = canvasOne.getContext("2d");

start.addEventListener("click",function(){
    flag = true;
    console.log("start");
    drawSpectrum();
});
end.addEventListener("click",function(){
    flag = false;
    console.log("end")
});
function init() {
    canvasTwo = document.getElementById('canvasTwo');
    ctx2 = canvasTwo.getContext("2d");
}
let last = 0;
function walkOrJump(num){
    if(num - last > 2000){
        console.log("jump");
    }else if(num > 400){
        last = num;
        console.log("walk");
    }else{
        console.log("stop");
    }
}
navigator.getMedia = ( navigator.getUserMedia ||
navigator.webkitGetUserMedia ||
navigator.mozGetUserMedia ||
navigator.msGetUserMedia);

navigator.getMedia ( { audio: true }, function (stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext);

    mic = audioContext.createMediaStreamSource(stream);

    analyser= audioContext.createAnalyser();

    analyser.fftSize = 256;
    mic.connect(analyser);
},function(){});



function drawSpectrum() {
    if(flag){
        var WIDTH = canvasOne.width;
        var HEIGHT= canvasOne.height;
        let sum = 0;
        var array =  new Uint8Array(128);
        analyser.getByteFrequencyData(array);
        array.forEach(function(value){
            sum+=value;
        });
        // console.log(sum);
        walkOrJump(sum);
//            ctx.clearRect(0, 0, WIDTH, HEIGHT);
//            ctx2.clearRect(0, 0, 800, 800);
//            for ( var i = 0; i < (array.length); i++ ){
//                var value = array[i];
//                ctx.fillRect(i*5,HEIGHT-value,3,HEIGHT);
//            }
//
//
//            for ( var i = 0; i < (array.length); i++ ){
//                var value = array[i];
//                ctx2.beginPath();
//                ctx2.arc(300,300,value,0,360,false);
//                ctx2.lineWidth=5;
//                ctx2.strokeStyle="rgba("+value+","+value+",0,0.2)";
//                ctx2.stroke();//画空心圆
//                ctx2.closePath();
//
//            }
        requestAnimationFrame(drawSpectrum);
    }

};

var context1;
var source;
var analyserfa;
var canvasFormAudio;
var ctxfa;

canvasFormAudio = document.getElementById('canvasFormAudio');
ctxfa = canvasFormAudio.getContext("2d");
try {

    context1 = new (window.AudioContext || window.webkitAudioContext);
} catch(e) {
    throw new Error('The Web Audio API is unavailable');
}

analyserfa=context1.createAnalyser();

window.addEventListener('load', function(e) {
    var audio =document.getElementById("audio");
    var source = context1.createMediaElementSource(audio);
    source.connect(analyserfa);
    analyserfa.connect(context1.destination);

    drawSpectrumfa();

}, false);
function drawSpectrumfa() {
    var WIDTH = canvasFormAudio.width;
    var HEIGHT= canvasFormAudio.height;

    var array =  new Uint8Array(128);

    analyserfa.getByteFrequencyData(array);

    ctxfa.clearRect(0, 0, WIDTH, HEIGHT);

    for ( var i = 0; i < (array.length); i++ ){
        var value = array[i];
        ctxfa.fillRect(i*5,HEIGHT-value,3,HEIGHT);
    }
    requestAnimationFrame(drawSpectrumfa);

}