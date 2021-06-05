const ANIM_ROT_SPEED = 10;       // Degrees/s        // TODO tweak
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
        this.children.forEach(function(child) {
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
            utils.MakeRotateXMatrix(deltaAngle)),
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
            utils.MakeRotateYMatrix(deltaAngle)),
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
            utils.MakeRotateZMatrix(deltaAngle)),
            inverseTrans),
            this.localMatrix
        );
    }

    /**
     *  Increases the rotation target (same conventions as rotate[XYZ] @see rotateX() ). The node will rotate to the current target within a certain amount of time.
     */
    updateXTarget(delta) {
        this.deltaAngleX += delta;
    }

    /**
     *  Increases the rotation target (same conventions as rotate[XYZ] @see rotateY() ). The node will rotate to the current target within a certain amount of time.
     */
    updateYTarget(delta) {
        this.deltaAngleY += delta;
    }

    /**
     *  Increases the rotation target (same conventions as rotate[XYZ] @see rotateZ() ). The node will rotate to the current target within a certain amount of time.
     */
    updateZTarget(delta) {
        this.deltaAngleZ += delta;
    }

    animate() {
        var currentTime = (new Date).getTime();
        if (lastUpdateTime) {
            var deltaT = (currentTime-lastUpdateTime);
            var deltaAngle = deltaT * ANIM_ROT_SPEED;

            // Update rotations AROUND ORIGIN AXES based on targets. Animation hierarchy: X -> Y -> Z
            if (Math.abs(this.deltaAngleX) < DELTA) {
                if (this.deltaAngleX < 0) deltaAngle = -deltaAngle;

                // Multiply local matrix for a rotation around X axis through [0,0,0] (need to change rotation axis wrt local matrix)
                this.localMatrix = utils.multiplyMatrices(utils.MakeRotateXMatrix(this.deltaAngleX), this.localMatrix);

                this.deltaAngleX -= deltaAngle; 
            } else if (Math.abs(this.deltaAngleY) < DELTA) {
                if (this.deltaAngleY < 0) deltaAngle = -deltaAngle;

                // Multiply local matrix for a rotation around Y axis through [0,0,0] (need to change rotation axis wrt local matrix) 
                this.localMatrix = utils.multiplyMatrices(utils.MakeRotateYMatrix(this.deltaAngleX), this.localMatrix);

                this.deltaAngleY -= deltaAngle; 
            } else if (Math.abs(this.deltaAngleZ) < DELTA) {
                if (this.deltaAngleY < 0) deltaAngle = -deltaAngle;

                // Multiply local matrix for a rotation around Z axis through [0,0,0] (need to change rotation axis wrt local matrix)
                this.localMatrix = utils.multiplyMatrices(utils.MakeRotateZMatrix(this.deltaAngleX), this.localMatrix);

                this.deltaAngleZ -= deltaAngle; 
            }

        }
        lastUpdateTime = currentTime;
        
        // Also animate children
        this.children.forEach(c => c.animate());
    }
}