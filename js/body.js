
var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;

// Create a place to store terrain geometry
var tVertexPositionBuffer;

//Create a place to store normals for shading
var tVertexNormalBuffer;

// Create a place to store the terrain triangles
var tIndexTriBuffer;

//Create a place to store the traingle edges
var tIndexEdgeBuffer;

// View parameters
var wholeView = vec3.fromValues(0.0,3.0,9.0);
var upperBodyView = vec3.fromValues(0.0,5.2,3.0);
var torsoView = vec3.fromValues(0.0,4.5,2.0);
var lowerBodyView = vec3.fromValues(0.0,1.8,3.2);
var legView = vec3.fromValues(0.0,0.5,2.0);
var headView = vec3.fromValues(0.0,6.4,0.2);
var viewDir = vec3.fromValues(0.0,0.0,-1.0);
var up = vec3.fromValues(0.0,1.0,0.0);
var viewPt = vec3.fromValues(0.0,0.0,0.0);

// Create the normal
var nMatrix = mat3.create();

// Create ModelView matrix
var mvMatrix = mat4.create();

//Create Projection matrix
var pMatrix = mat4.create();

var mvMatrixStack = [];
var meshes = {};

var activeTags = {};

//-------------------------------------------------------------------------
function drawParts(){
    for (var part in meshes) {
        gl.bindBuffer(gl.ARRAY_BUFFER, meshes[part].vertexBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,  meshes[part].vertexBuffer.itemSize,
                             gl.FLOAT, false, 0, 0);
         // Bind normal buffer
         gl.bindBuffer(gl.ARRAY_BUFFER, meshes[part].normalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
                                  meshes[part].normalBuffer.itemSize,
                                  gl.FLOAT, false, 0, 0);
        if(meshes[part].highlighted && (document.getElementById("allOptions").checked || activeTags[part])){
             gl.bindBuffer(gl.ARRAY_BUFFER, meshes[part].highlightColorBuffer);
             gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                                       meshes[part].highlightColorBuffer.itemSize,
                                       gl.FLOAT, false, 0, 0);
        }
        else {
             gl.bindBuffer(gl.ARRAY_BUFFER, meshes[part].colorBuffer);
             gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                                       meshes[part].colorBuffer.itemSize,
                                       gl.FLOAT, false, 0, 0);


        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, meshes[part].indexBuffer);
        gl.drawElements(gl.TRIANGLES, meshes[part].indexBuffer.numItems, gl.UNSIGNED_SHORT,0);
    }
}

//-------------------------------------------------------------------------
function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//-------------------------------------------------------------------------
function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,
                      false, pMatrix);
}

//-------------------------------------------------------------------------
function uploadNormalMatrixToShader() {
  mat3.fromMat4(nMatrix,mvMatrix);
  mat3.transpose(nMatrix,nMatrix);
  mat3.invert(nMatrix,nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

//----------------------------------------------------------------------------------
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------------------------------
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}

//----------------------------------------------------------------------------------
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

//----------------------------------------------------------------------------------
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

//----------------------------------------------------------------------------------
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);

  // If we don't find an element with the specified id
  // we do an early exit
  if (!shaderScript) {
    return null;
  }

  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

//----------------------------------------------------------------------------------
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
}


//-------------------------------------------------------------------------
function uploadLightsToShader(loc,a,d,h,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformHighlightLightColorLoc, h);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

//----------------------------------------------------------------------------------
function draw() {
    var transformVec = vec3.create();
    var eye = vec3.create;

    if(document.getElementById("whole").checked){
        eye = vec3.clone(wholeView);
    }
    else if (document.getElementById("upper").checked) {
        eye = vec3.clone(upperBodyView);
    }
    else if (document.getElementById("lower").checked) {
        eye = vec3.clone(lowerBodyView);
    }
    else if (document.getElementById("torso").checked) {
        eye = vec3.clone(torsoView);
    }
    else if (document.getElementById("legs").checked) {
        eye = vec3.clone(legView);
    }
    else {
        eye = vec3.clone(headView);
    }

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective
    mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);

    // We want to look down -z, so create a lookat point in that direction
    vec3.add(viewPt, eye, viewDir);
    // Then generate the lookat matrix and initialize the MV matrix to that view
    mat4.lookAt(mvMatrix,eye,viewPt,up);

    //Draw Terrain
    mvPushMatrix();
    vec3.set(transformVec,0.0,-0.5,-3.0);
    mat4.translate(mvMatrix, mvMatrix,transformVec);
    mat4.rotateX(mvMatrix, mvMatrix, degToRad(-90));
    //mat4.rotateZ(mvMatrix, mvMatrix, degToRad(25));

    mat4.rotateZ(mvMatrix, mvMatrix, degToRad(rot));
    setMatrixUniforms();
    uploadLightsToShader([0,0,-1],[0.0,0.0,0.0],[0.5,0.5,0.7],[0.5,0.0,0.0],[0.5,0.5,0.5]);
    drawParts();

    mvPopMatrix();

}

//----------------------------------------------------------------------------------
function animate() {
    rotate();
}
var rot = 0;
function rotate(){
    rot = (rot+(document.getElementById("rotSpeed").value/500))%360
}

//----------------------------------------------------------------------------------
function startup(tags) {
    canvas = document.getElementById("myGLCanvas");
    gl = createGLContext(canvas);
    setupShaders();

    const normColor = [0.5, 0.5, 0.7, 0.1];
    const hiColor = [0.7, 0.0, 0.0, 1];

    $.getJSON("./json/files.json", function(json) {
        function callback(mesh){
            meshes = mesh;
            for(var part in meshes){
                OBJ.initMeshBuffers(gl, meshes[part], normColor, hiColor, tags.hasOwnProperty(part));
            }
        }
        OBJ.downloadMeshes(json, callback);
    });

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.BLEND);

  gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
  gl.disable(gl.DEPTH_TEST);
  tick();
}

//----------------------------------------------------------------------------------
function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}

function updateActives(actives){
    activeTags = actives;
}
