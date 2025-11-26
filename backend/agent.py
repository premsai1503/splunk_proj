import io
import sys
import json
import base64
import traceback
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

import plotly.io as pio
import plotly.express as px
import plotly.graph_objects as go

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
        Execute Python code for data analysis and visualization.
        The environment has access to pandas (pd), matplotlib (plt), plotly (px, go), and the dataframe (_df).
        Returns execution status, textual output, and any generated plots (matplotlib images or plotly JSON).
        """
        try:
            # Clear previous plots
            plt.clf()
            plt.close('all')
                
            # Prepare execution environment
            local_namespace = {
                "_df": self._df,
                "pd": pd,
                "np": np,
                "sns": sns,
                "plt": plt,
                "px": px,
                "go": go,
                "json": json,
                "io": io,
                "base64": base64
            }
                
            # Capture output
            old_stdout = sys.stdout
            sys.stdout = io.StringIO()
                
            # Execute code
            exec(code, local_namespace)
                
            # Get output
            output = sys.stdout.getvalue()
            sys.stdout = old_stdout

            plotly_json = None
            image_base64 = None
            # -------------------------------
            # Detect Plotly figure
            # -------------------------------
            if "fig" in local_namespace and isinstance(local_namespace["fig"], go.Figure):
                fig = local_namespace["fig"]
                plotly_json = fig.to_json()
                
            # Check for generated plots
            # -------------------------------
            # Detect Matplotlib figure
            # -------------------------------
            if plotly_json is None:
                if plt.gcf().get_axes() or plt.get_fignums():  # If there are axes (plot was created)
                    buffer = io.BytesIO()
                    plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
                    buffer.seek(0)
                    image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
                    buffer.close()
                plt.close('all')
            
            # Store the graphs for later retrieval
            if plotly_json:
                self._graphs.append({'type': 'plotly_json', 'data': plotly_json})
            if image_base64:
                self._graphs.append({'type': 'image_base64', 'data': image_base64})

            print("============================")
            print("Graphs:", self._graphs)
            print("============================")
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
            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

            system_message = f"""
                You are a data analysis AI assistant.

                You have a pandas DataFrame named `_df` with columns:
                {list(self._df.columns)}

                You can generate:

                1. **Interactive Plotly plots**
                    - Use plotly.express or plotly.graph_objects
                    - **Never call fig.show()**
                    - Always assign Plotly figures to a variable named `fig`
                    - Example:
                        fig = px.line(_df, x='timestamp', y='response_time_ms')
                2. Always use the `exec_python` tool to execute Python code.
                3. After generating a plot, provide a short human-friendly explanation.
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

            print("\n============================\n")
            print("Running agent with query:", query)
            print("\n============================\n")
            result = self._agent.invoke(query)
            print("Full agent result:", result)
            last_message = result["messages"][-1].content
            print("\n============================\n")
            print("Agent result:", last_message)
            print("\n============================\n")
            return last_message
        except Exception as e:
            print(f"Error running agent: {e}")
            print(traceback.format_exc())
            raise e