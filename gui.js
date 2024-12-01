import * as Scene from './scene.js';
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