export default class Cubie extends Node {
    constructor(program, vao) {
        super()
        this.drawInfo = {
            materialColor: [0.6, 0.6, 0.0],
            programInfo: program,
            bufferLength: indexData.length,
            vertexArray: vao,
        };
        //this.targetAngle
        //this.lastUpdate
    }

    animate() {

    }
}