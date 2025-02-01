const questionsTable = document.getElementById('questions-table').querySelector('tbody');
const selectedQuestion = document.getElementById('selected-question');
let selectedLanguage = document.getElementById('language').value;
let selectedLevel = document.getElementById('level').value;
let filtered_questions_url = `http://127.0.0.1:5000/get-questions?programmingLanguage=${selectedLanguage}&level=${selectedLevel}`;
let filtered_search_url = ``;
    
    const codeMirror = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'text/x-java',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        theme: 'dracula',
        extraKeys: { "Ctrl-Space": "autocomplete"}
    });



    document.getElementById('language').addEventListener('change', function () {
        selectedLanguage = this.value;
        filtered_questions_url = `http://127.0.0.1:5000/get-questions?programmingLanguage=${selectedLanguage}&level=${selectedLevel}`;
        questionsTable.innerHTML = ``;
        load_table(filtered_questions_url);
        codeMirror.setOption('mode', selectedLanguage);
    });
    
    document.getElementById('level').addEventListener('change', function () {
        selectedLevel = this.value;
        filtered_questions_url = `http://127.0.0.1:5000/get-questions?programmingLanguage=${selectedLanguage}&level=${selectedLevel}`;
        questionsTable.innerHTML = ``;
        load_table(filtered_questions_url);
    });
    


    function load_table(fetch_data){
        fetch(fetch_data)
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
    
    }

    load_table(filtered_questions_url);


    questionsTable.addEventListener('click', function (event) {
        const row = event.target.closest('.question-area');
        if (row) {
            const question = row.textContent;
            selectedQuestion.textContent = question;
        }
    });


    document.getElementById('search-bar').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        filtered_search_url = `http://127.0.0.1:5000/search-questions?query=${query}`;
        questionsTable.innerHTML = ``;
        load_table(filtered_search_url);
        if(query === ''){
            load_table(filtered_questions_url);
        }
    });



    document.getElementById('compile-run-button');


    document.getElementById('confirm-button').addEventListener('click', function () {
        alert('Code submitted successfully!');
    });
