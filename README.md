# WebGL Rubick's Cube
### Project made for the Computer Graphics course at Politecnico di Milano

## Running the project: 
To run this project you need to clone this repository and run an http server in the folder. 

    git clone git@github.com:DPons97/CG-RubiksCube.git
    cd CG-RubicksCube
    python3 -m http.server
   
Then you can open your browser and go to http://localhost:8000/index.html

To run the local server you can also use tools like WAMP (https://www.wampserver.com/en/)
## Controlling the cube:
You can interact with the cube using the following keys:

 - Arrow Up/Down/Left/Right: rotate the whole cube
 - Shift + Arrow Left/Right: move camera around the cube
 - S: scramble the cube
- Shift + S: undo last scramble
- U: rotate up face
- D: rotate down face
- L: rotate left face
- R: rotate right face
- F: rotate front face
- B: rotate back face
- H/M/C: rotate middle faces
- Shift+\<rotate-face-key>: rotate in opposite direction

## Controlling lights:
Using the space bar it is possible to change the shaders in a round-robin fashion. The sliders on the right can be used to change the parameters of the current shader.
