    const codeMirror = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'text/x-java',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        theme: 'dracula',
        extraKeys: { "Ctrl-Space": "autocomplete"}
    });



    document.getElementById('language').addEventListener('change', function () {
        const selectedLanguage = this.value;
        codeMirror.setOption('mode', selectedLanguage);
    });

    document.getElementById('level').addEventListener('change', function () {
        console.log('Selected Level:', this.value);
    });


    const questionsTable = document.getElementById('questions-table').querySelector('tbody');
    const selectedQuestion = document.getElementById('selected-question');

    
    fetch('http://127.0.0.1:5000/get-questions')
    .then(response => response.json())
    .then(data => data.forEach(element => {  
        questionsTable.innerHTML +=  `
        <tr>
            <td onclick="document.getElementById('selected-question').scrollIntoView({ behavior: 'smooth' })">${element.questionNumber}</td>
            <td class="question-area" onclick="document.getElementById('selected-question').scrollIntoView({ behavior: 'smooth' })">${element.question}</td>
            <td onclick="document.getElementById('selected-question').scrollIntoView({ behavior: 'smooth' })">${element.level}</td>
        </tr>
    `
    
    }));


    questionsTable.addEventListener('click', function (event) {
        const row = event.target.closest('.question-area');
        if (row) {
            const question = row.textContent;
            selectedQuestion.textContent = question;
        }
    });


    document.getElementById('search-bar').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const question = row.cells[1].textContent.toLowerCase();

        rows.forEach(row => {
            const rows = questionsTable.querySelectorAll('tr');
            row.style.display = question.includes(query) ? '' : 'none';
        });
    });



    document.getElementById('compile-run-button');


    document.getElementById('confirm-button').addEventListener('click', function () {
        alert('Code submitted successfully!');
    });
