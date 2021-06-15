const ANIM_ROT_SPEED = 360;       // Degrees/s        // TODO tweak
const DELTA = 0.0001            // Delta for floating point comparison      // TODO move to utils

/**
 *  Default class for a Scene Graph NODE
 */
class Node {

    // default constructor
    constructor() {
        this.children = [];
        this.localMatrix = utils.identityMatrix();
        this.worldMatrix = utils.identityMatrix();

        // Animation stuff
        this.lastUpdateTime = (new Date).getTime();
        this.deltaAngleX = 0;
        this.deltaAngleY = 0;
        this.deltaAngleZ = 0;
    }

    /** 
     * Set the new parent for this node
     * @param parent The new parent of this node. Leave this to null only if this node is a root object in the scene
     */
    setParent(parent) {
        // remove us from our parent
        if (this.parent) {
            var ndx = this.parent.children.indexOf(this);

            if (ndx >= 0) {
                this.parent.children.splice(ndx, 1);
            }
        }

        // Add us to our new parent
        if (parent) {
            parent.children.push(this);
        }
        this.parent = parent;
    }

    /**
     * Multiplies a new transform matrix to the current world matrix of this node (propagates to all children)
     * @param matrix transform matrix to be applied
     */
    updateWorldMatrix(matrix) {
        if (matrix) {
            // a matrix was passed in so do the math
            this.worldMatrix = utils.multiplyMatrices(matrix, this.localMatrix);
        } else {
            // no matrix was passed in so just copy.
            utils.copy(this.localMatrix, this.worldMatrix);
        }

        // now process all the children
        var worldMatrix = this.worldMatrix;
        this.children.forEach(function (child) {
            child.updateWorldMatrix(worldMatrix);
        });
    }

    /**
     *  Rotates this node [delta] degrees clockwise (use negative delta to rotate counterclockwise) around origin X axis
     */
    rotateX(delta) {
        var inverseTrans = utils.MakeTranslateMatrix(-this.localMatrix[3], -this.localMatrix[7], -this.localMatrix[11]);
        this.localMatrix = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
            utils.invertMatrix(inverseTrans),
            utils.MakeRotateXMatrix(delta)),
            inverseTrans),
            this.localMatrix
        );
    }

    /**
     *  Rotates this node [delta] degrees clockwise (use negative delta to rotate counterclockwise) around origin Y axis
     */
    rotateY(delta) {
        var inverseTrans = utils.MakeTranslateMatrix(-this.localMatrix[3], -this.localMatrix[7], -this.localMatrix[11]);
        this.localMatrix = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
            utils.invertMatrix(inverseTrans),
            utils.MakeRotateYMatrix(delta)),
            inverseTrans),
            this.localMatrix
        );
    }

    /**
     *  Rotates this node [delta] degrees clockwise (use negative delta to rotate counterclockwise) around origin Z axis
     */
    rotateZ(delta) {
        var inverseTrans = utils.MakeTranslateMatrix(-this.localMatrix[3], -this.localMatrix[7], -this.localMatrix[11]);
        this.localMatrix = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
            utils.invertMatrix(inverseTrans),
            utils.MakeRotateZMatrix(delta)),
            inverseTrans),
            this.localMatrix
        );
    }

    /**
     *  Increases the rotation target (same conventions as rotate[XYZ] @see rotateX() ). The node will rotate to the current target within a certain amount of time.
     */
    updateXTarget(delta) {
        if (this.deltaAngleX < 180) {
            this.deltaAngleX += delta;
            return true;
        }
        return false;
    }

    /**
     *  Increases the rotation target (same conventions as rotate[XYZ] @see rotateY() ). The node will rotate to the current target within a certain amount of time.
     */
    updateYTarget(delta) {
        if (this.deltaAngleY < 180) {
            this.deltaAngleY += delta;
            return true;
        }
        return false;
    }

    /**
     *  Increases the rotation target (same conventions as rotate[XYZ] @see rotateZ() ). The node will rotate to the current target within a certain amount of time.
     */
    updateZTarget(delta) {
        if (this.deltaAngleZ < 180) {
            this.deltaAngleZ += delta;
            return true;
        }
        return false;
    }

    animate(deltaT) {
        if (this.lastUpdateTime) {
            var currentTime = (new Date).getTime();


            if (!deltaT){
                deltaT = (currentTime - this.lastUpdateTime)/1000;
            }
            var deltaAngle = deltaT * ANIM_ROT_SPEED;

            // Update rotations AROUND ORIGIN AXES based on targets. Animation hierarchy: X -> Y -> Z
            if (Math.abs(this.deltaAngleX) > 0) {
                if (this.deltaAngleX < 0) deltaAngle = -deltaAngle;
                if (Math.abs(this.deltaAngleX) < Math.abs(deltaAngle)) deltaAngle = this.deltaAngleX;

                // Multiply local matrix for a rotation around X axis through [0,0,0] (need to change rotation axis wrt local matrix)
                this.localMatrix = utils.multiplyMatrices(utils.MakeRotateXMatrix(deltaAngle), this.localMatrix);

                this.deltaAngleX -= deltaAngle;
            } else if (Math.abs(this.deltaAngleY) > 0) {
                if (this.deltaAngleY < 0) deltaAngle = -deltaAngle;
                if (Math.abs(this.deltaAngleY) < Math.abs(deltaAngle)) deltaAngle = this.deltaAngleY;

                // Multiply local matrix for a rotation around Y axis through [0,0,0] (need to change rotation axis wrt local matrix) 
                this.localMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(deltaAngle), this.localMatrix);

                this.deltaAngleY -= deltaAngle;
            } else if (Math.abs(this.deltaAngleZ) > 0) {
                console.log(this.deltaAngleZ);
                if (this.deltaAngleZ < 0) deltaAngle = -deltaAngle;
                if (Math.abs(this.deltaAngleZ) < Math.abs(deltaAngle)) deltaAngle = this.deltaAngleZ;

                // Multiply local matrix for a rotation around Z axis through [0,0,0] (need to change rotation axis wrt local matrix)
                this.localMatrix = utils.multiplyMatrices(utils.MakeRotateZMatrix(deltaAngle), this.localMatrix);

                this.deltaAngleZ -= deltaAngle;
            }

        }
        this.lastUpdateTime = currentTime;

        this.children.forEach(c => c.animate(deltaT)); // need to make sure delta T is same foreach cubies or rotation fucks up

    }
}