export default class Cubie extends Node {
    constructor(program, vao, fictPos) {
        super()
        this.fictMatrix = utils.makeTransitionMatrix(fictPos[0], fictPos[1], fictPos[2]); // matrix that keeps a fictitious position to find faces
        this.drawInfo = {
            materialColor: [0.6, 0.6, 0.0],
            programInfo: program,
            //bufferLength: indexData.length,
            vertexArray: vao,
        };
        //this.targetAngle
        //this.lastUpdate
    }

    animate() {

    }
}