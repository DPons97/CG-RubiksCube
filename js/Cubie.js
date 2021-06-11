export default class Cubie extends Node {
    constructor(objModel) {
        super()
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