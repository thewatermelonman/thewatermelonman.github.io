
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

let container;
let camera, scene, renderer;
let controls, sun ;
let plane, plane_filled;
let plane_material2;
const postprocessing = {};

let Options = {
    colors: [
                new THREE.Vector3(0.1, 0.1, 0.2),
                new THREE.Vector3(0.2, 0.6, 0.6),
                new THREE.Vector3(0.1, 0.1, 0.5),
                new THREE.Vector3(0.4, 0.1, 0.8)
    ]
};

let vert_shader = await (await fetch('./../shaders/hilldisplacement.vert')).text();
let frag_shader = await (await fetch('./../shaders/wireframe.frag')).text();
init();

function init() {


    container = document.body;

    //

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animate );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    container.appendChild( renderer.domElement );

    //

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75,                     // Field of View (in degrees)
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1,                    // Near clipping plane
        10000                    // Far clipping plane
    );

    // Step 2: Set Camera Position
    camera.position.set(700, 100, 700); // X, Y, Z position
    camera.lookAt(0, 0, 0);
    scene.add(camera);
    camera.updateProjectionMatrix();
    //

    sun = new THREE.Vector3();
    console.log(document.getElementById('vertexShader'));
    // Water
    const plane_geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    const plane_material = new THREE.MeshBasicMaterial({color: "white"});
    setupAttributes(plane_geometry);

    plane_material2 = new THREE.ShaderMaterial( {
        uniforms: { 
            'thickness': { value: 1.4 },
            'time': { value: 0.0 }, 
            'color_1': { value: new THREE.Vector3(0.7, 0.63, 0.8) },
            'color_2': { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        },
        vertexShader: vert_shader,
        fragmentShader: frag_shader,
        side: THREE.DoubleSide,
        alphaToCoverage: true // only works when WebGLRenderer's "antialias" is set to "true"

    });
    plane_filled = new THREE.Mesh(plane_geometry, plane_material);
    plane = new THREE.Mesh(plane_geometry, plane_material2);
    plane.rotation.x = -Math.PI / 2;
    plane_filled.rotation.x = Math.PI / 2;
    plane_filled.position.y = -0.01
    scene.add(plane);
    scene.add(plane_filled);


    // Skybox
    const ambientLight = new THREE.AmbientLight(0xffffff, 10000); // Color and Intensity
    scene.add(ambientLight);

    scene.background = new THREE.Color(0xffffff);
    const sky = new Sky();
    sky.scale.setScalar( 10000);
    //scene.add( sky );

    const skyUniforms = sky.material.uniforms;

    skyUniforms[ 'turbidity' ].value = 1;
    skyUniforms[ 'rayleigh' ].value = 1;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;

    const parameters = {
        elevation: 12,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    const sceneEnv = new THREE.Scene();

    let renderTarget;

    function updateSun() {

        const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
        const theta = THREE.MathUtils.degToRad( parameters.azimuth );

        sun.setFromSphericalCoords( 1, phi, theta );

        sky.material.uniforms[ 'sunPosition' ].value.copy( sun );

        if ( renderTarget !== undefined ) renderTarget.dispose();

        sceneEnv.add( sky );
        renderTarget = pmremGenerator.fromScene( sceneEnv );
        scene.add( sky );

        scene.environment = renderTarget.texture;

    }

    //updateSun();

    controls = new OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.495;
    //controls.target.set( 0, 10, 0 );
    controls.minDistance = 40.0;
    controls.maxDistance = 2000.0;
    controls.update();


    initPostprocessing();
    postprocessing.bokeh.uniforms[ 'focus' ].value = 170;
    postprocessing.bokeh.uniforms['aperture'].value = 1 * 0.00001;
    postprocessing.bokeh.uniforms['maxblur'].value = 0.01;

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    postprocessing.composer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    render();

}

function render() {

    const time = performance.now() * 0.001;
    plane_material2.uniforms.time.value = time;
    postprocessing.composer.render( 0.1 );

}

function setupAttributes(geometry) {

    const vectors = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1)
    ];

    const position = geometry.attributes.position;
    const centers = new Float32Array(position.count * 3);

    for (let i = 0, l = position.count; i < l; i++) {

        vectors[i % 3].toArray(centers, i * 3);

    }

    geometry.setAttribute('center', new THREE.BufferAttribute(centers, 3));

}

export function setOption_Color(colorIndex) {
    plane_material2.uniforms.color_1.value = Options.colors[colorIndex];
    console.log(Options.colors[colorIndex]);
}



function initPostprocessing() {

    const renderPass = new RenderPass(scene, camera);

    const bokehPass = new BokehPass(scene, camera, {
        focus: 1.0,
        aperture: 0.025,
        maxblur: 0.01
    });

    const outputPass = new OutputPass();

    const composer = new EffectComposer(renderer);

    composer.addPass(renderPass);
    composer.addPass(bokehPass);
    composer.addPass(outputPass);

    postprocessing.composer = composer;
    postprocessing.bokeh = bokehPass;

}