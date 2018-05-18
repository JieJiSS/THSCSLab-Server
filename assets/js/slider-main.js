function $_(query="") {
    return document.querySelectorAll(query);
}

window.addEventListener("DOMContentLoaded", function () {
    var sliders = $_("ul.slides");
    for (var i = 0; i < sliders.length; i++) {
        var slider = sliders[i];
        console.log(slider);
        var data = slider.attributes["v-data"].nodeValue;
        var arr = data.split(";");
        var option = {
            width: 600,
            duration: 2
        };
        for (var j = 0; j < arr.length; j++) {
            var kv = arr[j].split("="); // [key, value]
            if(kv[0] === "width" || kv[0] === "duration")
                option[kv[0]] = kv[1];
        }
        var imgs = slider.querySelectorAll("img");
        slider.removeChild(slider.querySelector("p"));
        for(var j = 0; j < imgs.length; j++) {
            var img = imgs[j];
            console.log(img);
            img.style.height = option.height;
            img.setAttribute("duration", option.duration);
            var a = document.createElement("a");
            var li = document.createElement("li");
            if(j === 0) {
                li.className = "clone";
            }
            a.appendChild(img);
            li.appendChild(a);
            slider.appendChild(li);
        }
    }
});
