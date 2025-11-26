import base64
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import analysisAgent

app = Flask(__name__)
CORS(app)

analysis_agent = analysisAgent()

@app.route('/connect', methods=['GET'])
def connect():
    try:
        # time.sleep(7)  # Simulate some delay
        if not analysis_agent.isDataLoaded:
            analysis_agent.load_data('./sample_logs.json')
        if not analysis_agent.isAgentInitialized:
            analysis_agent.initialize_agent()

        sample_values = {}
        for column in analysis_agent._df.columns:
            # Check if the column contains list-like entries by inspecting the first non-null element
            # We must ensure the column is not empty after dropping NaNs to avoid an IndexError
            if not analysis_agent._df[column].dropna().empty:
                first_non_null = analysis_agent._df[column].dropna().iloc[0]
                if isinstance(first_non_null, list):
                    # If it's a list, explode it first to get individual items, then get unique values
                    exploded_series = analysis_agent._df[column].dropna().explode()
                    sample_values[column] = exploded_series.unique()[:5].tolist()
                else:
                    # Otherwise, proceed as before
                    sample_values[column] = analysis_agent._df[column].dropna().unique()[:5].tolist()
            else:
            # Handle cases where the column is entirely null or empty after dropping NaNs
                sample_values[column] = []

        response = {
            'status': 'connected',
            'columns': analysis_agent._df.columns.tolist(),
            'column_types': analysis_agent._df.dtypes.apply(lambda x: str(x)).to_dict(),
            'values': sample_values  # Example values
        }
        print("CONNECT RESPONSE:", response)
        return jsonify(response)
    except Exception as e:
        print(f"Error in /connect: {e}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate():
    try:
        prompt = request.json.get('prompt')
        message = {"messages": [{"role": "user", "content": prompt}]}

        result = analysis_agent.run_agent(message)
        if analysis_agent._graphs[-1]['type'] == 'plotly_json':
            plot_string = analysis_agent._graphs[-1]['data']
            image_string = None
        elif analysis_agent._graphs[-1]['type'] == 'image_base64':
            plot_string = None
            image_string = analysis_agent._graphs[-1]['data']
        else:
            plot_string = None
            image_string = None
        response = {
            'status': 'success',
            'plot': plot_string,
            'image': image_string,
            'text': result
        }

        print("\n============================\n")
        print("GENERATE RESPONSE:", response)
        print("\n============================\n")
        return jsonify(response)
    except Exception as e:
        print(f"Error in /generate: {e}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)