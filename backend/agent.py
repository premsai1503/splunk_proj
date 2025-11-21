import io
import sys
import traceback
import base64
import json
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use a non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI


class analysisAgent:
    def __init__(self):
        self._df = None
        self._agent = None
        self._graphs = []
        self.isDataLoaded = False
        self.isAgentInitialized = False

    def load_data(self, file_path: str):
        try:
            df = pd.read_json(file_path, lines=True)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            # Optional: Flatten the 'headers' column into separate columns
            # Normalize the 'headers' column into a new DataFrame
            headers_normalized = pd.json_normalize(df['headers'], sep='_')

            # Prefix the new column names to avoid potential conflicts with existing columns
            headers_normalized.columns = ['header_' + col for col in headers_normalized.columns]

            # Concatenate the new headers columns with the original DataFrame and drop the old 'headers' column
            df = pd.concat([df.drop('headers', axis=1), headers_normalized], axis=1)
            self._df = df
            self.isDataLoaded = True
            print(df.head())
        except Exception as e:
            print(f"Error loading data: {e}")
            print(traceback.format_exc())
            raise e

    def _exec_python(self, code: str):
        """
            Execute Python code in a controlled environment
            
            Args:
                code: Python code to execute
                
            Returns:
                dict with status, output, error, and image (if any)

            Execute Python code. This tool executes Python code in a sandboxed environment.
                The environment has access to:
                - pandas as 'pd'
                - matplotlib.pyplot as 'plt'
                - dataframe as '_df' (loaded from sample_data.json)
                - numpy, json, io, base64
                
                Use this tool to:
                1. Create visualizations (graphs, charts, plots) using matplotlib
                2. Perform data analysis
                3. Generate tables and summaries

                The tool automatically captures and encodes generated images as base64.
        """
        try:
            # Clear previous plots
            plt.clf()
            plt.close('all')
                
            # Prepare execution environment
            local_namespace = {
                'pd': __import__('pandas'),
                'plt': plt,
                '_df': self._df,
                'json': json,
                'io': io,
                'base64': base64,
                'np': __import__('numpy'),
                'sns': __import__('seaborn'),
            }
                
            # Capture output
            old_stdout = sys.stdout
            sys.stdout = io.StringIO()
                
            # Execute code
            exec(code, local_namespace)
                
            # Get output
            output = sys.stdout.getvalue()
            sys.stdout = old_stdout
                
            # Check for generated plots
            image_base64 = None
            if plt.gcf().get_axes() or plt.get_fignums():  # If there are axes (plot was created)
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
                buffer.seek(0)
                image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
                buffer.close()
                self._graphs.append(image_base64)
            plt.close('all')
                
            return {
                'status': 'success',
                'output': output if output else 'Code executed successfully',
                'error': None            
            }
                
        except Exception as e:
            sys.stdout = old_stdout
            plt.close('all')
                
            error_msg = f"{type(e).__name__}: {str(e)}\n{traceback.format_exc()}"
                
            return {
                'status': 'error',
                'output': None,
                'error': error_msg
            }
    
    def initialize_agent(self):
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash", 
                temperature=0.7
            )
            system_message = f"""You are a helpful AI assistant that can execute Python code.
                You have a pandas DataFrame named `_df` loaded with this structure:{self._df.head(3).to_string()}.
                columns: {list(self._df.columns)}.
                When generating matplotlib code, do NOT call plt.show().
                The environment will capture and return the image automatically.
                Use the tool 'exec_python' to execute Python code for data analysis and visualization.
                Always return a brief description of the graph after executing code.
            """
            self._agent = create_agent(
                model=llm,
                tools=[self._exec_python],
                system_prompt=system_message,
            )
            self.isAgentInitialized = True
        except Exception as e:
            print(f"Error initializing agent: {e}")
            print(traceback.format_exc())
            raise e
    
    def run_agent(self, query):
        try:
            if not self._agent:
                raise Exception("Agent not initialized. Call initialize_agent() first.")
            # print("Running agent with query:", query)
            result = self._agent.invoke(query)
            print("Full agent result:", result)
            last_message = result["messages"][-1].content
            print("Agent result:", last_message)
            return last_message
        except Exception as e:
            print(f"Error running agent: {e}")
            print(traceback.format_exc())
            raise e