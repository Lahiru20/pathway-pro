document.addEventListener('DOMContentLoaded', () => {
    const interviewData = JSON.parse(localStorage.getItem('interviewQuestions'));
    const candidateName = localStorage.getItem('candidateName');
    const interviewTime = localStorage.getItem('interviewTime');
    
    let currentQuestion = 0;
    let timer;
    let timeLeft;
    let responses = [];
    
    
    document.getElementById('candidate-name').textContent = `Candidate: ${candidateName}`;
    const questions = interviewData.questions;
    const timePerQuestion = calculateTimePerQuestion(interviewTime, questions.length);
    
    
    responses = questions.map((question, index) => ({
        questionNumber: index + 1,
        question: question.question,
        answer: '',
        timeSpent: 0
    }));

    
    showQuestion(currentQuestion);
    startTimer(timePerQuestion);

    function calculateTimePerQuestion(totalTime, numQuestions) {
        const timeMap = {
            '30mins': 30 * 60,
            '40mins': 40 * 60,
            '1hour': 60 * 60,
            '2hour': 120 * 60
        };
        return (timeMap[totalTime] / numQuestions) * 1000; 
    }

    function showQuestion(index) {
        const question = questions[index];
        document.getElementById('question-number').textContent = `Question ${index + 1} of ${questions.length}`;
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('answer-input').value = responses[index].answer;
        
        
        responsiveVoice.speak(question.question, "UK English Male", {
            rate: 1,
            pitch: 1,
            onend: () => console.log('Question read complete')
        });

        
        document.getElementById('prev-btn').disabled = index === 0;
        document.getElementById('next-btn').textContent = index === questions.length - 1 ? 'Finish' : 'Next';
    }

    function startTimer(duration) {
        let startTime = Date.now();
        let remaining = duration;
        
        timer = setInterval(() => {
            remaining = duration - (Date.now() - startTime);
            
            if (remaining <= 0) {
                clearInterval(timer);
                if (currentQuestion < questions.length - 1) {
                    nextQuestion();
                } else {
                    finishInterview();
                }
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            document.getElementById('timer').textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    function nextQuestion() {
        saveResponse(currentQuestion);
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            showQuestion(currentQuestion);
            clearInterval(timer);
            startTimer(timePerQuestion);
        } else {
            finishInterview();
        }
    }

    function previousQuestion() {
        saveResponse(currentQuestion);
        currentQuestion--;
        showQuestion(currentQuestion);
        clearInterval(timer);
        startTimer(timePerQuestion);
    }

    function saveResponse(index) {
        responses[index].answer = document.getElementById('answer-input').value;
        responses[index].timeSpent = timePerQuestion - (remaining || 0);
    }

    function finishInterview() {
        clearInterval(timer);
        localStorage.setItem('interviewResponses', JSON.stringify(responses));
        window.location.href = 'interview_summary.html';
    }
});