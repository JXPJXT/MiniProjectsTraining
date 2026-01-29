from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from sklearn.tree import DecisionTreeClassifier
import uvicorn

X = np.array([[1,1],[1,0],[0,1],[0,0],[1,1],[0,0]])
y = [1,1,0,0,1,0]
model = DecisionTreeClassifier().fit(X, y)

ENCODE = {"smooth":1,"bumpy":0,"red":1,"orange":0}
LABEL = {1:"Apple",0:"Orange"}

class FruitInput(BaseModel):
    texture: str
    color_code: str

app = FastAPI()

@app.post("/predict_fruit/")
async def predict_fruit(f: FruitInput):
    x = [[ENCODE[f.texture.lower()], ENCODE[f.color_code.lower()]]]
    return {"predicted_fruit": LABEL[model.predict(x)[0]]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
