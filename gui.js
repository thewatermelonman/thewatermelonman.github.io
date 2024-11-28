
import { setOption_Color } from "./scene.js";


clickEventOnClass("dropbtn", (event) => {
    event.target.nextElementSibling.style.display = "block";
});

let setColor = (event) => {
    let index = event.target.value;
    setOption_Color(index);
    event.target.parentNode.style.display = "none";
    let toBlur = event.target.parentNode.previousElementSibling;
    console.log(toBlur);
    event.target.parentNode.previousElementSibling.blur();

};
clickEventOnClass("colorbtn", setColor);


function clickEventOnClass(className, callbackFunction) {
    let elements = document.getElementsByClassName(className);
    Array.from(elements).forEach((element) => element.addEventListener('click', callbackFunction));
}