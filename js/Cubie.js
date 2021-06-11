export default class Cubie extends Node {
    constructor(objModel, fictMatrix) {
        super()
        this.fictMatrix = utils.makeTransitionMatrix(fictPos[0], fictPos[1], fictPos[2]); // matrix that keeps a fictitious position to find faces
        this.drawInfo = objModel
        this.vao = null
        //this.targetAngle
        //this.lastUpdate
    }

    setVao(vao) {
        this.vao = vao
    }

    animate() {

    }
}