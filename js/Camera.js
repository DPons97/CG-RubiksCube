const CAMERA_ROT_SPEEED = 3;

export default class Camera extends Node { 
    constructor() {
        super();
        this.isShift = false;
        this.worldMatrix = utils.MakeWorld(5.0, 5.0, -10.0, 0.0, 0.0, 0.0);
        this.localMatrix = this.worldMatrix;
        this.target = [0.0, 0.0, 0.0];
        this.up = [0, 1.0, 0];
    }

    rotateCameraY(positive) {
        var delta = positive ? CAMERA_ROT_SPEEED : -CAMERA_ROT_SPEEED;
        this.localMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(delta), this.localMatrix);
    }
}