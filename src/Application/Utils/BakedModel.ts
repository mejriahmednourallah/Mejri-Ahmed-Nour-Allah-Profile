import * as THREE from 'three';

export default class BakedModel {
    model: LoadedModel;
    texture: LoadedTexture | null;
    material: THREE.MeshBasicMaterial | null;

    constructor(model: LoadedModel, texture?: LoadedTexture, scale?: number) {
        this.model = model;
        this.texture = texture || null;

        // If texture is provided, use baked texture approach
        if (this.texture) {
            this.texture.flipY = false;
            this.texture.encoding = THREE.sRGBEncoding;

            this.material = new THREE.MeshBasicMaterial({
                map: this.texture,
            });

            this.model.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (scale) child.scale.set(scale, scale, scale);
                    child.material.map = this.texture;
                    child.material = this.material;
                }
            });
        } else {
            // No texture provided - use model's original materials
            this.material = null;
            this.model.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (scale) child.scale.set(scale, scale, scale);
                    // Keep original materials from the model file
                    // If material exists, make sure it's compatible with lighting
                    if (child.material) {
                        // Convert to MeshStandardMaterial for better lighting if it's basic
                        if (child.material instanceof THREE.MeshBasicMaterial && child.material.map) {
                            const newMat = new THREE.MeshStandardMaterial({
                                map: child.material.map,
                                color: child.material.color,
                            });
                            child.material = newMat;
                        }
                    }
                }
            });
        }

        return this;
    }

    getModel(): THREE.Group {
        return this.model.scene;
    }
}
