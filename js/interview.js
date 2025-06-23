const candidateName = localStorage.getItem("candidateName");
const language = localStorage.getItem("language");
const interviewQuestions = JSON.parse(
  localStorage.getItem("interviewQuestions")
);

if (!candidateName || !language || !interviewQuestions) {
  alert("Missing interview data. Please start over.");
  window.location.href = "index.html";
}

let currentIndex = 0;
let responses = [];
let timerInterval;

function displayQuestion(index) {
  if (index >= interviewQuestions.length) {
    showSummary();
    return;
  }
  const question = interviewQuestions[index];
  document.getElementById("question-container").innerHTML = `
                <div class="interview-layout">
                    <div class="bot-side">
                        <div class="bot-container">
                            <div class="lava"></div>
                            <div class="sphere"></div>
                        </div>
                    </div>
                    <div class="question-side">
                        <div class="timer-container">
                            <div class="question-count">Question ${
                              index + 1
                            } of ${interviewQuestions.length}</div>
                            <div>Time: <span id="timer"></span></div>
                        </div>
                        <h3>${question.question}</h3>
                        <textarea id="response" rows="8" cols="50" placeholder="Type your answer here..."></textarea>
                        <div style="text-align: right;">
                            <button id="submit-btn">Submit Answer</button>
                        </div>
                    </div>
                </div>
            `;

  let remainingTime = question.time * 60;
  updateTimerDisplay(remainingTime);
  timerInterval = setInterval(() => {
    remainingTime--;
    updateTimerDisplay(remainingTime);
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      submitAnswer();
    }
  }, 1000);
  document.getElementById("submit-btn").addEventListener("click", () => {
    clearInterval(timerInterval);
    submitAnswer();
  });

  if (typeof responsiveVoice !== "undefined") {
    responsiveVoice.speak(question.question, "UK English Male");
  }
}

function updateTimerDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById("timer").textContent = `${minutes}:${
    secs < 10 ? "0" : ""
  }${secs}`;
}

function submitAnswer() {
  if (typeof responsiveVoice !== "undefined") {
    responsiveVoice.cancel();
  }
  const response = document.getElementById("response").value;
  responses.push({
    question: interviewQuestions[currentIndex].question,
    response: response,
  });
  currentIndex++;
  displayQuestion(currentIndex);
}

function showSummary() {
  document.getElementById("question-container").style.display = "none";
  const summaryContainer = document.getElementById("summary-container");
  let summaryHTML = `
                <h2>Interview Summary</h2>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <p><strong>Candidate:</strong> ${candidateName}</p>
                        <p><strong>Language:</strong> ${language}</p>
                    </div>
                </div>
            `;
  responses.forEach((item, index) => {
    summaryHTML += `
                    <h4>Question ${index + 1}: ${item.question}</h4>
                    <pre>${item.response || "No response provided"}</pre>
                `;
  });
  summaryContainer.innerHTML = summaryHTML;
  summaryContainer.style.display = "block";
}

document.getElementById("summary-container").style.display = "none";
displayQuestion(0);
