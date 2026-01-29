import numpy as np
from sklearn.tree import DecisionTreeClassifier
import gradio as gr

X = np.array([[1,1],[1,0],[0,1],[0,0],[1,1],[0,0]])
y = [1,1,0,0,1,0]
model = DecisionTreeClassifier().fit(X, y)

ENCODE = {"Smooth":1,"Bumpy":0,"Red":1,"Orange":0}
LABEL = {1:"Apple",0:"Orange"}

def predict_fruit(texture, color):
    return LABEL[model.predict([[ENCODE[texture], ENCODE[color]]])[0]]

gr.Interface(
    fn=predict_fruit,
    inputs=[gr.Dropdown(["Smooth","Bumpy"]), gr.Dropdown(["Red","Orange"])],
    outputs="text",
    title="Fruit Classifier"
).launch()
