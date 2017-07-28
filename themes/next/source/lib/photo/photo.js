/*
* @Author: anchen
* @Date:   2017-07-25 16:44:54
* @Last Modified by:   anchen
* @Last Modified time: 2017-07-28 17:39:44
*/

'use strict';

$(function(){
    var data = new Array(
    "20170725-1.jpg",
    "20170726-1.jpg",
    "20170726-2.jpg",
    "20170726-3.jpg",
    "20170726-4.jpg",
    "20170726-5.jpg"
    );

    var wrap = document.getElementById("wrap");
    for (var i = 0; i < data.length; i++) {
        var l = document.createElement("li");
        l.setAttribute("height","auto");
        l.setAttribute("display","inline-block");
        l.setAttribute("list-style","inline-none");

        var d = document.createElement("div");
        d.setAttribute("height","auto");
        d.setAttribute("width","180px");
        var a = document.createElement("a");
        a.setAttribute("class","grouped_elements fancybox");
        a.setAttribute("rel","group");
        var  tmp1 = "http://otbsz8hna.bkt.clouddn.com/images/"+data[i];
        a.setAttribute("href",tmp1);
        var im = document.createElement("img");
        im.setAttribute("class","lazy");
        var  tmp2 = "http://otbsz8hna.bkt.clouddn.com/images/"+data[i]+"?imageView2/1/w/300/h/300/q/100"
        im.setAttribute("data-original",tmp2);
        a.appendChild(im);
        d.appendChild(a);
        l.appendChild(d);
        wrap.appendChild(l);
    }
    $("img.lazy").lazyload({
    effect : "fadeIn"
    });
})
