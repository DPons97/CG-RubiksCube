export default class Cubie extends Node {
    constructor(objModel, fictPos) {
        super()
        this.fictMatrix = utils.MakeTranslateMatrix(fictPos[0], fictPos[1], fictPos[2]); // matrix that keeps a fictitious position to find faces
        this.drawInfo = objModel
        this.vao = null
    }

    setVao(vao) {
        this.vao = vao
    }

}