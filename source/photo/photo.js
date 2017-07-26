/*
* @Author: anchen
* @Date:   2017-07-25 16:44:54
* @Last Modified by:   anchen
* @Last Modified time: 2017-07-26 11:21:59
*/

'use strict';
var data = new Array(
    "20170725-1.jpg",
    "IMG_0944.JPG",
    "IMG_0945.JPG",
    "IMG_0946.JPG",
    "IMG_0947.JPG",
    "IMG_0948.JPG",
    "IMG_0949.JPG",
    "IMG_0950.JPG",
    "IMG_0943.JPG",
    "IMG_0944.JPG",
    "IMG_0945.JPG",
    "IMG_0946.JPG",
    "IMG_0947.JPG"
);
var wrap = document.getElementById("wrap");
// position:relative;
// margin:0px auto;
// -webkit-column-height:150px;
// -moz-cloumn-height:150px;

for (var i = 0; i < data.length; i++) {

    var l = document.createElement("li");
    //height:180px;display:inline-block;list-style:none;
    l.setAttribute("height","auto");
    l.setAttribute("display","inline-block");
    l.setAttribute("list-style","inline-none");



    var d = document.createElement("div");
    d.setAttribute("height","auto");
    d.setAttribute("width","180px");
    var a = document.createElement("a");
    a.setAttribute("class","grouped_elements");
    a.setAttribute("rel","group1");
    var  tmp1 = "http://7xrywe.com1.z0.glb.clouddn.com/"+data[i];
    a.setAttribute("href",tmp1);
    var im = document.createElement("img");
    im.setAttribute("class","lazy");
    im.setAttribute("src","/images/img-err.png");
    var  tmp2 = "http://7xrywe.com1.z0.glb.clouddn.com/"+data[i]+"?imageView2/1/w/300/h/300/q/100"
    im.setAttribute("data-original",tmp2);
    a.appendChild(im);
    d.appendChild(a);
    l.appendChild(d);
    wrap.appendChild(l);
}

$("img.lazy").lazyload({
effect : "fadeIn" ,failurelimit : 10
});