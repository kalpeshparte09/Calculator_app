const display = document.getElementById("display");
const expression = document.getElementById("expression");
const modeLabel = document.getElementById("modeLabel");
const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const copyResultButton = document.getElementById("copyResult");
const clearHistoryButton = document.getElementById("clearHistory");
const themeToggle = document.getElementById("themeToggle");

let firstNumber = null;
let operator = null;
let waitingForSecondOperand = false;
let history = [];

function updateDisplay(value) {
    display.innerText = value;
}

function setExpressionText(text) {
    expression.innerText = text;
}

function setMode(text) {
    modeLabel.innerText = text;
}

function getDisplayValue() {
    return display.innerText;
}

function normalizeResult(value) {
    if (!Number.isFinite(value)) {
        return "Error";
    }

    const rounded = Math.round((value + Number.EPSILON) * 1000000000) / 1000000000;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function press(num) {
    const currentValue = getDisplayValue();

    if (currentValue === "Error") {
        updateDisplay(String(num));
        setMode("Typing");
        return;
    }

    if (waitingForSecondOperand || currentValue === "0") {
        updateDisplay(String(num));
        waitingForSecondOperand = false;
    } else {
        updateDisplay(currentValue + String(num));
    }

    setMode("Typing");
}

function pressDecimal() {
    const currentValue = getDisplayValue();

    if (waitingForSecondOperand || currentValue === "Error") {
        updateDisplay("0.");
        waitingForSecondOperand = false;
        setMode("Typing decimal");
        return;
    }

    if (!currentValue.includes(".")) {
        updateDisplay(currentValue + ".");
        setMode("Typing decimal");
    }
}

function setOperator(op) {
    const currentValue = Number(getDisplayValue());

    if (getDisplayValue() === "Error") {
        clearAll();
        return;
    }

    if (operator !== null && !waitingForSecondOperand) {
        calculate();
        firstNumber = Number(getDisplayValue());
    } else {
        firstNumber = currentValue;
    }

    operator = op;
    waitingForSecondOperand = true;
    setExpressionText(`${normalizeResult(firstNumber)} ${getOperatorLabel(op)}`);
    setMode("Operator selected");
}

function calculate() {
    if (operator === null || firstNumber === null) {
        setMode("Nothing to solve");
        return;
    }

    const secondNumber = Number(getDisplayValue());
    let result;

    if (operator === "+") {
        result = firstNumber + secondNumber;
    } else if (operator === "-") {
        result = firstNumber - secondNumber;
    } else if (operator === "*") {
        result = firstNumber * secondNumber;
    } else if (operator === "/") {
        if (secondNumber === 0) {
            updateDisplay("Error");
            setExpressionText("Division by zero");
            setMode("Invalid operation");
            firstNumber = null;
            operator = null;
            waitingForSecondOperand = false;
            return;
        }

        result = firstNumber / secondNumber;
    }

    const normalized = normalizeResult(result);
    const historyExpression = `${normalizeResult(firstNumber)} ${getOperatorLabel(operator)} ${normalizeResult(secondNumber)}`;
    updateDisplay(normalized);
    setExpressionText(`${historyExpression} =`);
    setMode("Calculated");
    addToHistory(historyExpression, normalized);
    firstNumber = result;
    operator = null;
    waitingForSecondOperand = true;
}

function clearAll() {
    updateDisplay("0");
    setExpressionText("0");
    setMode("Ready");
    firstNumber = null;
    operator = null;
    waitingForSecondOperand = false;
}

function backspace() {
    const currentValue = getDisplayValue();

    if (currentValue === "Error" || waitingForSecondOperand) {
        updateDisplay("0");
        waitingForSecondOperand = false;
        setMode("Ready");
        return;
    }

    const updated = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
    updateDisplay(updated === "-" ? "0" : updated);
    setMode("Edited");
}

function applyPercent() {
    const currentValue = Number(getDisplayValue());

    if (getDisplayValue() === "Error") {
        return;
    }

    const result = normalizeResult(currentValue / 100);
    updateDisplay(result);
    setMode("Percent");
}

function toggleSign() {
    const currentValue = getDisplayValue();

    if (currentValue === "0" || currentValue === "Error") {
        return;
    }

    updateDisplay(currentValue.startsWith("-") ? currentValue.slice(1) : `-${currentValue}`);
    setMode("Sign changed");
}

function getOperatorLabel(op) {
    return op === "*" ? "x" : op;
}

function addToHistory(exp, result) {
    history.unshift({ exp, result });
    history = history.slice(0, 8);
    renderHistory();
}

function renderHistory() {
    historyCount.innerText = `${history.length} ${history.length === 1 ? "item" : "items"}`;

    if (history.length === 0) {
        historyList.innerHTML = '<p class="history-empty">Your completed calculations will appear here.</p>';
        return;
    }

    historyList.innerHTML = history.map((item) => `
        <article class="history-item">
            <p class="history-item__expression">${item.exp}</p>
            <p class="history-item__result">${item.result}</p>
        </article>
    `).join("");
}

async function copyResult() {
    const value = getDisplayValue();

    if (value === "Error") {
        setMode("Cannot copy error");
        return;
    }

    try {
        await navigator.clipboard.writeText(value);
        setMode("Result copied");
    } catch (error) {
        setMode("Copy unavailable");
    }
}

function clearHistory() {
    history = [];
    renderHistory();
    setMode("History cleared");
}

function applyTheme(theme) {
    document.body.classList.toggle("light-theme", theme === "light");
    localStorage.setItem("calculator-theme", theme);
}

function toggleTheme() {
    const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
    applyTheme(nextTheme);
}

function handleKeyboardInput(event) {
    const { key } = event;

    if (/\d/.test(key)) {
        press(key);
        return;
    }

    if (key === ".") {
        pressDecimal();
        return;
    }

    if (["+","-","*","/"].includes(key)) {
        setOperator(key);
        return;
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
        return;
    }

    if (key === "Backspace") {
        backspace();
        return;
    }

    if (key === "Escape") {
        clearAll();
    }
}

function initializeCalculator() {
    const savedTheme = localStorage.getItem("calculator-theme");
    applyTheme(savedTheme || "dark");
    renderHistory();

    copyResultButton.addEventListener("click", copyResult);
    clearHistoryButton.addEventListener("click", clearHistory);
    themeToggle.addEventListener("click", toggleTheme);
    window.addEventListener("keydown", handleKeyboardInput);
}

initializeCalculator();
