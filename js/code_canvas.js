const questionsTable = document
  .getElementById("questions-table")
  .querySelector("tbody");
const selectedQuestion = document.getElementById("selected-question");
const result_container = document.getElementById("result-container");
let selectedLanguage = document.getElementById("language").value;
let selectedLevel = document.getElementById("level").value;
let filtered_questions_url = `http://127.0.0.1:5000/get-questions?programmingLanguage=${selectedLanguage}&level=${selectedLevel}`;
let filtered_search_url = ``;

function load_table(fetch_data) {
  fetch(fetch_data)
    .then((response) => response.json())
    .then((data) =>
      data.forEach((element) => {
        questionsTable.innerHTML += `
        <tr>
            <td onclick="document.getElementById('selected-question').scrollIntoView({ behavior: 'smooth' })">${element.questionNumber}</td>
            <td class="question-area" onclick="document.getElementById('selected-question').scrollIntoView({ behavior: 'smooth' })">${element.question}</td>
            <td onclick="document.getElementById('selected-question').scrollIntoView({ behavior: 'smooth' })">${element.level}</td>
        </tr>
    `;
      })
    );
}

const codeMirror = CodeMirror.fromTextArea(document.getElementById("code"), {
  mode: "text/x-java",
  lineNumbers: true,
  autoCloseBrackets: true,
  matchBrackets: true,
  theme: "dracula",
  extraKeys: { "Ctrl-Space": "autocomplete" },
});

document.getElementById("language").addEventListener("change", function () {
  selectedLanguage = this.value;
  filtered_questions_url = `http://127.0.0.1:5000/get-questions?programmingLanguage=${selectedLanguage}&level=${selectedLevel}`;
  questionsTable.innerHTML = ``;
  load_table(filtered_questions_url);
  codeMirror.setOption("mode", selectedLanguage);
});

document.getElementById("level").addEventListener("change", function () {
  selectedLevel = this.value;
  filtered_questions_url = `http://127.0.0.1:5000/get-questions?programmingLanguage=${selectedLanguage}&level=${selectedLevel}`;
  questionsTable.innerHTML = ``;
  load_table(filtered_questions_url);
});

load_table(filtered_questions_url);

questionsTable.addEventListener("click", function (event) {
  const row = event.target.closest(".question-area");
  if (row) {
    const question = row.textContent;
    selectedQuestion.textContent = question;
  }
  codeMirror.setValue("");
  result_container.innerHTML = ``;
});

document.getElementById("search-bar").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  filtered_search_url = `http://127.0.0.1:5000/search-questions?query=${query}`;
  questionsTable.innerHTML = ``;
  load_table(filtered_search_url);
  if (query === "") {
    load_table(filtered_questions_url);
  }
});

document
  .getElementById("compile-clear-canvas")
  .addEventListener("click", function () {
    codeMirror.setValue("");
  });

async function fetchChatResponse(userQuestion, userCode) {
  result_container.innerHTML = `
                <div class="load-container">
                    <div class="loader"></div>
                </div> 
    `;
  const response = await fetch("http://127.0.0.1:5000/codecanvas-result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: userQuestion, code: userCode }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
}

let userQuestion = "";
let userCode = ``;

document
  .getElementById("confirm-button")
  .addEventListener("click", function () {
    userQuestion = document.getElementById("selected-question").innerText;
    userCode = codeMirror.getValue();

    if (
      selectedQuestion.innerText ==
      "Select a question from the table above to solve it here.."
    ) {
      alert("Select a question from the table above to solve it here..");
    } else if (!codeMirror.getValue().trim()) {
      alert("Please write some code before confirm!");
    } else {
      fetchChatResponse(userQuestion, userCode)
        .then((response) => {
          result_container.innerHTML = ``;

          let rating_by_stars = `☆☆☆☆☆`;
          if (response.rating >= 5) {
            rating_by_stars = `★★★★★`;
          } else if (response.rating >= 4) {
            rating_by_stars = `★★★★☆`;
          } else if (response.rating >= 3) {
            rating_by_stars = `★★★☆☆`;
          } else if (response.rating >= 2) {
            rating_by_stars = `★★☆☆☆`;
          } else if (response.rating >= 1) {
            rating_by_stars = `★☆☆☆☆`;
          } else {
            rating_by_stars = "☆☆☆☆☆";
          }

          result_container.innerHTML += `
              
                <h4>Feedback is ready—scroll down to view!</h4>
                <div class="feedback-container">
                        <h1>Feedback</h1>
                        <div class="feedback-item">
                            <p>${response.motivation_message}</p>
                        </div>
                        <div class="feedback-item">
                            <h2>Improved Code</h2>
                            <pre><code>${response.improved_code}</code></pre>
                        </div>
                        <div class="feedback-item">
                            <h2>Rating : <span class="stars">${rating_by_stars}</span></h2>
                        </div>
                        <div class="feedback-item">
                            <h2>Completion Status</h2>
                            <p>Status: <strong>${response.completion_status}</strong></p>
                        </div>
                    </div>

                    `;
        })
        .catch((error) => {
          result_container.innerHTML += `
              
                    <div class="feedback-container">
                        <h1>Error connecting with PathwayPro platform</h1>
                    </div> `;
        });
    }
  });
