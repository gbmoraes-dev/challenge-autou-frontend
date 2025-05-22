const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const fileName = document.getElementById("file-name");
const textInput = document.getElementById("text-input");
const form = document.getElementById("request-form");
const responseCard = document.querySelector(".response-card");

let selectedFile = null;

document.addEventListener("DOMContentLoaded", () => {
	setupDragAndDrop();
	setupFileInput();
	setupForm();
});

function setupDragAndDrop() {
	["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
		dropArea.addEventListener(eventName, preventDefaults, false);
		document.body.addEventListener(eventName, preventDefaults, false);
	});

	["dragenter", "dragover"].forEach((eventName) => {
		dropArea.addEventListener(eventName, highlight, false);
	});

	["dragleave", "drop"].forEach((eventName) => {
		dropArea.addEventListener(eventName, unhighlight, false);
	});

	dropArea.addEventListener("drop", handleDrop, false);

	dropArea.addEventListener("click", () => fileInput.click());
}

function setupFileInput() {
	fileInput.addEventListener("change", (e) => {
		handleFiles(e.target.files);
	});
}

function setupForm() {
	form.addEventListener("submit", handleSubmit);
}

function preventDefaults(e) {
	e.preventDefault();
	e.stopPropagation();
}

function highlight() {
	dropArea.classList.add("dragover");
}

function unhighlight() {
	dropArea.classList.remove("dragover");
}

function handleDrop(e) {
	const dt = e.dataTransfer;
	handleFiles(dt.files);
}

function handleFiles(files) {
	if (files.length > 0) {
		selectedFile = files[0];
		fileName.textContent = selectedFile.name;

		textInput.value = "";
	}
}

async function handleSubmit(e) {
	e.preventDefault();

	const hasFile = selectedFile !== null;
	const hasText = textInput.value.trim() !== "";

	if (!hasFile && !hasText) {
		alert("Por favor, selecione um arquivo ou digite um texto para análise.");
		return;
	}

	const formData = new FormData();

	if (hasFile) {
		formData.append("file", selectedFile);
	} else {
		formData.append("text", textInput.value.trim());
	}

	try {
		showLoading();

		const response = await fetch(
			"https://challenge-autou-backend.onrender.com/upload",
			{
				method: "POST",
				body: formData,
			},
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		displayResults(data);

		clearSelectedFile();
	} catch (error) {
		console.error("Erro na requisição:", error);
		showError(error.message);
	} finally {
		hideLoading();
	}
}

function showLoading() {
	const button = form.querySelector('button[type="submit"]');
	button.disabled = true;
	button.textContent = "Analisando...";
	button.style.backgroundColor = "#6c757d";
}

function hideLoading() {
	const button = form.querySelector('button[type="submit"]');
	button.disabled = false;
	button.textContent = "Analyze";
	button.style.backgroundColor = "";
}

function displayResults(data) {
	responseCard.innerHTML = `
        <h1>Analysis result:</h1>
        <div class="result-section">
            <h2>CATEGORIA:</h2>
            <div class="category-result">${data.category}</div>
        </div>
        <div class="result-section">
            <h2>RESPOSTA:</h2>
            <div class="response-result">${data.response.replace(/(\r\n|\n|\r)/g, "<br>")}</div>
        </div>
    `;

	responseCard.scrollIntoView({
		behavior: "smooth",
		block: "start",
	});
}

function showError(message) {
	responseCard.innerHTML = `
        <h1>Erro na análise:</h1>
        <div class="error-message">
            <p>Ocorreu um erro ao processar sua solicitação:</p>
            <p><strong>${message}</strong></p>
            <p>Verifique sua conexão e tente novamente.</p>
        </div>
    `;
}

function clearSelectedFile() {
	selectedFile = null;
	fileName.textContent = "Nenhum arquivo selecionado";
	fileInput.value = "";
}

function clearForm() {
	clearSelectedFile();
	textInput.value = "";
}

function resetAnalysis() {
	clearForm();
	responseCard.innerHTML = `
        <h1>Analysis result:</h1>
        <h2>CATEGORIA:</h2>
        <p>RESPOSTA</p>
    `;
}
