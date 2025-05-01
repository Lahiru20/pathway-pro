import json
from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
import requests # type: ignore
import model


app = Flask(__name__)

CORS(app)


@app.route('/get-questions', methods=['GET'])
def get_questions():
    level = request.args.get('level') 
    programming_language = request.args.get('programmingLanguage')
    question_Number = request.args.get("questionNumber")

    filtered_questions = model.question_model

    if level:
        new_filtered_questions = [] 
        for q in filtered_questions:
            if q['level'].lower() == level.lower():
                new_filtered_questions.append(q) 
        filtered_questions = new_filtered_questions  


    if programming_language:
        new_filtered_questions = []  
        for q in filtered_questions:
            if q['programmingLanguage'].lower() == programming_language.lower():
                new_filtered_questions.append(q)  
        filtered_questions = new_filtered_questions  

    if question_Number:
        new_filtered_questions = []  
        for q in filtered_questions:
            if q['questionNumber'] == question_Number:
                new_filtered_questions.append(q)  
        filtered_questions = new_filtered_questions


    return jsonify(filtered_questions)


@app.route('/search-questions', methods=['GET'])
def search_questions():
    query = request.args.get('query', '').lower()
    if not query:
        return jsonify({"error": "Query parameter is empty"}), 400
    
    filtered_questions = [q for q in model.question_model if query in q['question'].lower()]
    
    if filtered_questions:
        return jsonify(filtered_questions)
    else:
        return jsonify({"message": "No matching questions found"}), 404
    
    
    
@app.route('/codecanvas-result', methods=['POST'])
def codecanvas():
    
    user_question = request.json.get('question', '')
    user_code = request.json.get('code', '')

    
    prompt = f"""
    The user asked the following question:
    ```
    {user_question}
    ```

    And provided the following code as their answer:
    ```
    {user_code}
    ```

    Your task is to:
    1. Evaluate the code as an answer to the question.
    2. Improve the code if necessary and provide the improved version.
    3. Motivate the user based on their effort.
    4. Rate the code as an answer out of 5 (1 being poor, 5 being excellent).
    5. Determine if the code is "Completed" (if it fully answers the question) or "Incomplete" (if it does not fully answer the question).

    Provide your response in the following JSON format:
    {{
        "improved_code": "Improved version of the user's code (if applicable) or your code seems good enough",
        "motivation_message": "Motivational message for the user and feedback to develop more as a developer",
        "rating": "Rating out of 5",
        "completion_status": "Completed or Incomplete"
    }}
    """

    
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": "Bearer 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",
            "Content-Type": "application/json"
        },
        data=json.dumps({
            "model": "openchat/openchat-7b",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
    )

    
    openrouter_response = response.json()
    openchat_message = openrouter_response['choices'][0]['message']['content']

    try:
        final_response = json.loads(openchat_message)
    except json.JSONDecodeError:
        final_response = {
            "improved_code": "error retrieving data from server. try again",
            "motivation_message": "error retrieving data from server. try again",
            "rating": "ERROR",
            "completion_status": "error retrieving data from server. try again",
            "error": "ERROR"
        }

    return jsonify(final_response)


@app.route('/generate-interview', methods=['POST'])
def generate_interview():
 
    params = request.json
    language = params.get('language', '')
    target_time = params.get('time', '')
    level = params.get('level', '').lower()

    prompt = f"""
    Generate a technical interview JSON array for {language} developers.
    Difficulty Level: {level.capitalize()}
    Total Time: {target_time} minutes
    
    Requirements:
    - Array of 6-12 question objects
    - Each object has:
      qid: sequential number
      question: question according to time distribution
      time: minutes for the candidate to answer
    - Questions should progress from simple to complex
    - Include language-specific best practices
    - Interview should not exceed the total time
    
    Example format:
    [
      {{
        "qid": 1,
        "question": "Explain variables in {language}",
        "time": 3
      }},
      {{
        "qid": 2,
        "question": "How to handle memory management in {language}?",
        "time": 5
      }}
    ]
    """

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": "Bearer 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",
            "Content-Type": "application/json"
        },
        data=json.dumps({
            "model": "openchat/openchat-7b",
            "messages": [{
                "role": "user",
                "content": prompt
            }],
            "temperature": 0.7
        })
    )

    try:
        interview = response.json()['choices'][0]['message']['content']
        return jsonify(json.loads(interview))
    except Exception as e:
        return jsonify({
            "error": "Failed to generate interview",
            "details": str(e)
        }), 500
    


if __name__ == "__main__":
    app.run(debug = True)
