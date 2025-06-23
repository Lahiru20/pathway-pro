import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
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

    You MUST respond in EXACTLY the following JSON format with NO additional text:
    {{
        "improved_code": "Improved version of the code or 'Your code seems good enough'",
        "motivation_message": "Motivational feedback message",
        "rating": "Integer between 1-5",
        "completion_status": "Completed or Incomplete"
    }}
    """

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": "",
                "Content-Type": "application/json"
            },
            data=json.dumps({
                "model": "deepseek/deepseek-chat-v3-0324",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "max_tokens": 2048,
                "temperature": 0.2
            }),
            timeout=30 
        )
        response.raise_for_status()

        openrouter_response = response.json()
        content = openrouter_response['choices'][0]['message']['content']

        final_response = json.loads(content)
        

        required_keys = {"improved_code", "motivation_message", "rating", "completion_status"}
        if not all(key in final_response for key in required_keys):
            return jsonify({
                "error": "Invalid response structure from AI",
                "response": final_response
            }), 500

        return jsonify(final_response)

    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "API request failed",
            "details": str(e)
        }), 500
    except json.JSONDecodeError:
        return jsonify({
            "error": "Invalid JSON response from AI",
            "content": content if 'content' in locals() else "No content"
        }), 500
    except KeyError:
        return jsonify({
            "error": "Malformed API response",
            "response": openrouter_response
        }), 500

@app.route('/generate-interview', methods=['POST'])
def generate_interview():
    params = request.json
    language = params.get('language', '')
    target_time = params.get('time', '')
    level = params.get('level', '').lower()

    if not language or not target_time or not level:
        return jsonify({
            "error": "Missing required parameters: language, time, or level"
        }), 400

    prompt = f"""
    Generate a technical interview JSON array for {language} developers.
    Difficulty Level: {level.capitalize()}
    Total Time: {target_time} minutes

    Requirements:
    - Output MUST be a valid JSON array of question objects
    - Array should contain 6-12 questions
    - Each object must have:
        "qid": sequential integer (starting from 1)
        "question": the interview question text
        "time": estimated time in minutes to answer
    - Questions should progress from simple to complex
    - Include questions about language-specific best practices
    - Total interview time should be approximately {target_time} minutes

    Return ONLY the JSON array with NO additional text, explanations, or code formatting.
    Example: [{{"qid": 1, "question": "...", "time": 3}}, ...]
    """

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": "",
                "Content-Type": "application/json"
            },
            data=json.dumps({
                "model": "deepseek/deepseek-chat-v3-0324",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "max_tokens": 2048,
                "temperature": 0.7
            }),
            timeout=45 
        )
        response.raise_for_status()

        openrouter_response = response.json()
        content = openrouter_response['choices'][0]['message']['content']


        interview_data = json.loads(content)
        

        if isinstance(interview_data, list):
            return jsonify(interview_data)
        elif isinstance(interview_data, dict) and "questions" in interview_data:
            return jsonify(interview_data["questions"])
        elif isinstance(interview_data, dict) and "interview" in interview_data:
            return jsonify(interview_data["interview"])
        else:
            # Try to find any array in the response
            for value in interview_data.values():
                if isinstance(value, list):
                    return jsonify(value)
            
            return jsonify({
                "error": "No valid interview array found",
                "response": interview_data
            }), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "API request failed",
            "details": str(e)
        }), 500
    except json.JSONDecodeError:
        return jsonify({
            "error": "Invalid JSON response from AI",
            "content": content
        }), 500
    except KeyError:
        return jsonify({
            "error": "Malformed API response",
            "response": openrouter_response
        }), 500

if __name__ == "__main__":
    app.run(debug=True)