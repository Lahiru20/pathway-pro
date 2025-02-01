from flask import Flask, request, jsonify
from flask_cors import CORS
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


if __name__ == "__main__":
    app.run(debug = True)