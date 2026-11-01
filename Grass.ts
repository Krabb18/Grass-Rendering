import * as THREE from 'three';
import vertexShader from "./shaders/vertex.glsl?raw";
import fragmentShader from "./shaders/fragment.glsl?raw";

export class Grass
{
    private landscapeMesh: THREE.Mesh;
    private center: THREE.Vector3;

    private patchSize: number = 20;
    private baldeHeight:number = 0.005;
    private bladeWidth:number = 0.08; 

    private noiseMap: THREE.Texture;
    private grassMap: THREE.Texture;
    private terrainNoiseMap: THREE.Texture;
    private material!: THREE.ShaderMaterial;
    constructor(landscapeMesh: THREE.Mesh)
    {
        this.landscapeMesh = landscapeMesh;
        this.center = new THREE.Vector3();

        this.landscapeMesh.geometry.computeBoundingBox();
        this.landscapeMesh.geometry.boundingBox?.getCenter(this.center);

        const textureLoader = new THREE.TextureLoader();
        this.grassMap = textureLoader.load('save.png');
        this.terrainNoiseMap = textureLoader.load('noise.png');
        this.noiseMap = textureLoader.load('noise2.png');
        console.log(this.grassMap)
    }

    generateGrass(scene: THREE.Scene)
    {
        const positions: any[] = [];
        const colors: any[] = [];
        const uvs: any[] = [];
        const indices: any[] = [];
        const bladeOrigins: any[] = [];
        const yaws: any[] = [];
        const currentPosition = new THREE.Vector3();
        const uv = new THREE.Vector2();
        const yawUnitVec = new THREE.Vector3();

        const grassNum = 50000;

        for(let i = 0; i<grassNum; i++)
        {
            currentPosition.x = THREE.MathUtils.randFloat(-this.patchSize *0.5, this.patchSize*0.5);
            currentPosition.y = 0;
            currentPosition.z = THREE.MathUtils.randFloat(-this.patchSize*0.5, this.patchSize*0.5);

            const u = THREE.MathUtils.mapLinear(currentPosition.x, this.landscapeMesh.geometry.boundingBox?.min.x as number, this.landscapeMesh.geometry.boundingBox?.max.x as number, 0, 1);
            const v = THREE.MathUtils.mapLinear(currentPosition.y, this.landscapeMesh.geometry.boundingBox?.min.y as number, this.landscapeMesh.geometry.boundingBox?.max.y as number,0,1);
            uv.set(u, v); //Nachher noch ändern

            const yaw = Math.random() * Math.PI * 2;
            yawUnitVec.set(Math.sin(yaw), 0, -Math.cos(yaw));

            //Blade vertices
            const bl = currentPosition;
            const br = currentPosition;
            const tc = currentPosition;

            const verts = [
                { pos: bl.toArray(), color: [0.1, 0, 0] },
                { pos: br.toArray(), color: [0, 0, 0.1] },
                { pos: tc.toArray(), color: [1, 1, 1] },
            ]

            const vertexCount = verts.length;
            const vArrOffset = i * vertexCount;

            verts.forEach((vert, index) =>{
                positions.push(...vert.pos);
                colors.push(...vert.color);
                uvs.push(...uv.toArray());
                yaws.push(...yawUnitVec);
                bladeOrigins.push(...currentPosition.toArray());
            });

            indices.push(vArrOffset, vArrOffset + 1, vArrOffset + 2);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setAttribute("aYaw",new THREE.BufferAttribute(new Float32Array(yaws), 3));
        geometry.setAttribute("aBladeOrigin",new THREE.BufferAttribute(new Float32Array(bladeOrigins), 3));

        geometry.computeVertexNormals();

        this.material = new THREE.ShaderMaterial(
            {
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                vertexColors: true,
                side: THREE.DoubleSide,
                uniforms: {
                    uBladeWidth: {value: this.bladeWidth},
                    grassMap: {value: this.grassMap},
                    noiseMap: {value: this.noiseMap},
                    uHeightNoiseAmplitude: { value: 3 },
                    uMaxBladeHeight: { value: 0.35 },
                    terrainNoiseMap: {value: this.terrainNoiseMap},
                    time: {value: 0.0}
                }
            }
        );

        const grassMesh = new THREE.Mesh(geometry, this.material);
        grassMesh.frustumCulled = false;
        scene.add(grassMesh);
    }

    update(time: number){
        this.material.uniforms.time.value = time;
    }
}