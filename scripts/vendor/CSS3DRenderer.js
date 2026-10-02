/*
 * Minimal CSS3DRenderer extracted from three.js https://threejs.org/
 * three.js is released under the MIT License. Copyright © 2010-2024 three.js authors.
 * The implementation below is adapted to provide the CSS3DRenderer and CSS3DObject
 * required for the Wordsworth scroll experience.
 */

(function(){
    if (typeof THREE === 'undefined') return;

    const epsilon = (value) => Math.abs(value) < 1e-6 ? 0 : value;

    function getCameraCSSMatrix(matrix) {
        const elements = matrix.elements;
        return 'matrix3d(' +
            epsilon(elements[0]) + ',' + epsilon(-elements[1]) + ',' + epsilon(elements[2]) + ',' + epsilon(elements[3]) + ',' +
            epsilon(elements[4]) + ',' + epsilon(-elements[5]) + ',' + epsilon(elements[6]) + ',' + epsilon(elements[7]) + ',' +
            epsilon(elements[8]) + ',' + epsilon(-elements[9]) + ',' + epsilon(elements[10]) + ',' + epsilon(elements[11]) + ',' +
            epsilon(elements[12]) + ',' + epsilon(-elements[13]) + ',' + epsilon(elements[14]) + ',' + epsilon(elements[15]) + ')';
    }

    function getObjectCSSMatrix(matrix) {
        const elements = matrix.elements;
        return 'translate3d(-50%,-50%,0) matrix3d(' +
            epsilon(elements[0]) + ',' + epsilon(elements[1]) + ',' + epsilon(elements[2]) + ',' + epsilon(elements[3]) + ',' +
            epsilon(-elements[4]) + ',' + epsilon(-elements[5]) + ',' + epsilon(-elements[6]) + ',' + epsilon(-elements[7]) + ',' +
            epsilon(elements[8]) + ',' + epsilon(elements[9]) + ',' + epsilon(elements[10]) + ',' + epsilon(elements[11]) + ',' +
            epsilon(elements[12]) + ',' + epsilon(elements[13]) + ',' + epsilon(elements[14]) + ',' + epsilon(elements[15]) + ')';
    }

    THREE.CSS3DObject = function(element) {
        THREE.Object3D.call(this);
        this.element = element || document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.transformStyle = 'preserve-3d';
        this.isCSS3DObject = true;
    };

    THREE.CSS3DObject.prototype = Object.create(THREE.Object3D.prototype);
    THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject;

    THREE.CSS3DSprite = function(element) {
        THREE.CSS3DObject.call(this, element);
        this.isCSS3DSprite = true;
    };

    THREE.CSS3DSprite.prototype = Object.create(THREE.CSS3DObject.prototype);
    THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite;

    THREE.CSS3DRenderer = function() {
        const domElement = document.createElement('div');
        domElement.style.overflow = 'hidden';
        domElement.style.position = 'absolute';
        domElement.style.top = '0';
        domElement.style.left = '0';
        domElement.style.transformStyle = 'preserve-3d';

        const cameraElement = document.createElement('div');
        cameraElement.style.transformStyle = 'preserve-3d';
        domElement.appendChild(cameraElement);

        let width = 0;
        let height = 0;
        let widthHalf = 0;
        let heightHalf = 0;

        this.domElement = domElement;

        this.setSize = function(newWidth, newHeight) {
            width = newWidth;
            height = newHeight;
            widthHalf = width / 2;
            heightHalf = height / 2;

            domElement.style.width = width + 'px';
            domElement.style.height = height + 'px';
            cameraElement.style.width = width + 'px';
            cameraElement.style.height = height + 'px';
        };

        function renderObject(object) {
            if (object.isCSS3DObject) {
                const style = object.element.style;

                if (object.visible === false) {
                    style.display = 'none';
                } else {
                    style.display = '';
                    style.transform = getObjectCSSMatrix(object.matrixWorld);
                    style.transformStyle = 'preserve-3d';
                    if (object.element.parentNode !== cameraElement) {
                        cameraElement.appendChild(object.element);
                    }
                }
            }

            for (let i = 0, l = object.children.length; i < l; i += 1) {
                renderObject(object.children[i]);
            }
        }

        this.render = function(scene, camera) {
            if (!scene || !camera) return;

            scene.updateMatrixWorld();
            if (!camera.parent) camera.updateMatrixWorld();

            camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

            const fov = camera.isPerspectiveCamera ? camera.projectionMatrix.elements[5] * heightHalf : heightHalf;

            domElement.style.perspective = camera.isPerspectiveCamera ? fov * 2 + 'px' : '';
            cameraElement.style.transform = getCameraCSSMatrix(camera.matrixWorldInverse) + ' translateZ(' + fov + 'px)';

            renderObject(scene);
        };
    };
})();

