document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const language = document.getElementById('language').value;
    const difficulty = document.getElementById('difficulty').value;
    const interviewTime = document.getElementById('interviewTime').value;
    const candidateName = document.getElementById('candidateName').value;
    const submit_button = document.getElementById('submit-button');

    const postData = {
      language: language,
      time: interviewTime,
      level: difficulty 
    };

    submit_button.addEventListener('click', () => {
      generateInterview(postData, candidateName, language);
    });
  
    async function generateInterview(postData, candidateName, language) {
      try {
        const response = await fetch('http://127.0.0.1:5000/generate-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const questions = await response.json();

        localStorage.setItem('candidateName', candidateName);
        localStorage.setItem('language', language);
        localStorage.setItem('interviewQuestions', JSON.stringify(questions));

        const cn = localStorage.getItem('candidateName');
        const q = JSON.parse(localStorage.getItem('interviewQuestions'));
        const l = localStorage.getItem('language');

        console.log(`Candidate: ${cn}`);
        console.log(`Language: ${l}`);
        console.log('Questions:', q);
      } catch (error) {
        console.error('Error:', error);
        alert('Error generating interview. Please try again.');
      }

      window.location.href = 'interview.html';
    }


  });