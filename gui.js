import * as Scene from './scene.js';
var root = document.querySelector(':root');
let hex_val = (index) => getComputedStyle(document.body).getPropertyValue('--color-' + "abcd".charAt(index));
Alpine.store('settings', {
        color: null,
        shape: null,
        texture: null,
        season: null,

        setShape(value) {
            this.shape = value;
            console.log("test");
        },

        setColor(value) {
            this.color = value;
            root.style.setProperty(
                "--active-color", 
                hex_val(value)
            );
            Scene.setOption_Color(value);
        },

        setTexture(value) {
            this.texture = value;
        },

        setSeason(value) {
            this.season = value;
        },

});
 
//Alpine.start();