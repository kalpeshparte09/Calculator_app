let firstNumber = null;
let operator = null;

function press(num){
    let display = document.getElementById("display");

    if (display.innerText === "0") {
        (display.innerText = num); 
    } else {
        display.innerText += num;
    }
}

function setOperator(op) {
    let display = document.getElementById("display");

    firstNumber = Number(display.innerText);
    operator = op;

    display.innerText = "0";
}

function calculate() {
    let display = document.getElementById("display");
    let secondNumber = Number(display.innerText);

    let result;

    if (operator === "+") {
        result = firstNumber + secondNumber;
    } else if (operator === "-") {
        result = firstNumber - secondNumber;
    } else if (operator === "*") {
        result = firstNumber * secondNumber;
    } else if (operator === "/") {
        if (secondNumber === 0) {
            display.innerText = "Error";
            return;
        }
        result = firstNumber / secondNumber;
    }

    display.innerText = result;
}

function clearAll() {
    document.getElementById("display").innerText = "0";
    firstNumber = null;
    operator = null;
}
