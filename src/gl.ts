import _ from 'underscore'
import { mat4 } from 'gl-matrix'

var cubeRotation = 0.0

class AttribLocations {
    vertexPosition: GLint
    vertexColor: GLint
    constructor(vertexPosition: GLint, vertexColor: GLint) {
        this.vertexPosition = vertexPosition
        this.vertexColor = vertexColor
    }
}

class UniformLocations {
    projectionMatrix: WebGLUniformLocation
    modelViewMatrix: WebGLUniformLocation
    constructor(projectionMatrix: WebGLUniformLocation, modelViewMatrix: WebGLUniformLocation) {
        this.projectionMatrix = projectionMatrix
        this.modelViewMatrix = modelViewMatrix
    }
}

class ProgramInfo {
    program: WebGLProgram
    attribLocations: AttribLocations
    uniformLocations: UniformLocations
    constructor(program: WebGLProgram, attribLocations: AttribLocations, uniformLocations: UniformLocations) {
        this.program = program
        this.attribLocations = attribLocations
        this.uniformLocations = uniformLocations
    }
}

class Buffers {
    position: WebGLBuffer
    color: WebGLBuffer
    indices: WebGLBuffer
    constructor(position: string, color: WebGLBuffer, indices: WebGLBuffer) {
        this.position = position
        this.color = color
        this.indices = indices
    }
}

class GL {
    context: WebGLRenderingContext
    programInfo: ProgramInfo
    buffers: Buffers
    constructor(context: WebGLRenderingContext, programInfo: ProgramInfo, buffers: Buffers) {
        this.context = context
        this.programInfo = programInfo
        this.buffers = buffers
    }
}

function initGl(w: number, h: number): GL {
    const canvas = createCanvas(w, h)
    const gl = initWebGL(canvas)
    const shaderProgram = initShaderProgram(gl)
    const programInfo = createProgramInfo(shaderProgram, gl)
    const buffers = initBuffers(gl)
    return new GL(gl, programInfo, buffers)
}

function calculateImageData(time: number, gl: GL): Uint8Array {
    drawScene(gl.context, gl.programInfo, gl.buffers, time * 0.00001)
    const imageData = getImageData(gl.context)
    return imageData
}

function initWebGL(canvas: HTMLCanvasElement): WebGLRenderingContext {
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext
    if (!gl) {
        alert("Can not initialize WebGL.")
    }
    return gl
}

function createCanvas(w: number, h: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas") as HTMLCanvasElement
    canvas.id = "canvas"
    canvas.width = w
    canvas.height = h
    document.getElementsByTagName("body")[0].appendChild(canvas)
    return canvas
}

function createProgramInfo(shaderProgram: WebGLProgram, gl: WebGLRenderingContext): ProgramInfo {
    return {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor")
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix") as WebGLUniformLocation,
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix") as WebGLUniformLocation
        }
    }
}

function componentToHex(c: number): string {
    const hex = c === undefined ? "00" : c.toString(16)
    return hex.length === 1 ? "0" + hex : hex
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

function getImageData(gl: WebGLRenderingContext): Uint8Array {
    const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    return pixels
}

function cubePositions(): number[] {
    const front = [-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0]
    const back = [-1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0]
    const top = [-1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0]
    const bottom = [-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0]
    const right = [1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0]
    const left = [-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0]
    const faces = _.flatten([front, back, top, bottom, right, left])
    return faces
}

function cubeColors(): number[][] {
    const purple = [163 / 255, 73 / 255, 164 / 255, 1.0] //#A349A4
    const yellow = [255 / 255, 242 / 255, 0 / 255, 1.0] //#FFF200
    const red = [237 / 255, 28 / 255, 36 / 255, 1.0] //#ED1C24
    const blue = [63 / 255, 72 / 255, 204 / 255, 1.0] //#3F48CC
    const orange = [255 / 255, 127 / 255, 39 / 255, 1.0] //#FF7F27
    const green = [34 / 255, 177 / 255, 76 / 255, 1.0] //#22B14C
    return [purple, yellow, red, blue, orange, green]
}

function cubeIndices(): number[] {
    const front = [0, 1, 2, 0, 2, 3]
    const back = [4, 5, 6, 4, 6, 7]
    const top = [8, 9, 10, 8, 10, 11]
    const bottom = [12, 13, 14, 12, 14, 15]
    const right = [16, 17, 18, 16, 18, 19]
    const left = [20, 21, 22, 20, 22, 23]
    const trianglePairs = _.flatten([front, back, top, bottom, right, left])
    return trianglePairs
}

function createColors(faceColors: number[][]) {
    return faceColors.reduce((acc, c) => acc.concat(c, c, c, c), [])
}

function initBuffers(gl: WebGLRenderingContext): Buffers {
    const positionBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = cubePositions()
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    const faceColors = cubeColors()
    const colors = createColors(faceColors)
    const colorBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
    const indexBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    const indices = cubeIndices()
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    return { position: positionBuffer, color: colorBuffer, indices: indexBuffer }
}

function drawScene(gl: WebGLRenderingContext, programInfo: ProgramInfo, buffers: Buffers, deltaTime: number) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0) //full black
    gl.clearDepth(1.0) //clear everything
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL) //near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const fieldOfView = 45 * Math.PI / 180 //radians
    const can = gl.canvas as HTMLCanvasElement
    const aspect = can.clientWidth / can.clientHeight
    const zNear = 0.1 //min distance
    const zFar = 100.0 //max distance

    //note: glmatrix.js always has the first argument as the destination to receive the result.
    const projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)
    const modelViewMatrix = mat4.create() //start in center
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -5.0])
    const zSpeed = cubeRotation
    const xSpeed = cubeRotation * 0.618
    const ySpeed = cubeRotation * -1.618
    mat4.rotate(modelViewMatrix, modelViewMatrix, zSpeed, [0, 0, 1])
    mat4.rotate(modelViewMatrix, modelViewMatrix, xSpeed, [0, 1, 0])
    mat4.rotate(modelViewMatrix, modelViewMatrix, ySpeed, [1, 0, 0])
    {
        const numComponents = 3
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
        const vPos = programInfo.attribLocations.vertexPosition
        gl.vertexAttribPointer(vPos, numComponents, type, normalize, stride, offset)
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
    }
    {
        const numComponents = 4
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
        const vCol = programInfo.attribLocations.vertexColor
        gl.vertexAttribPointer(vCol, numComponents, type, normalize, stride, offset)
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
    gl.useProgram(programInfo.program)
    const pMatrix = programInfo.uniformLocations.projectionMatrix;
    gl.uniformMatrix4fv(pMatrix, false, projectionMatrix)
    const mvMatrix = programInfo.uniformLocations.modelViewMatrix
    gl.uniformMatrix4fv(mvMatrix, false, modelViewMatrix)
    {
        const vertexCount = 36
        const type = gl.UNSIGNED_SHORT
        const offset = 0
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
    }
    cubeRotation += deltaTime
}

function initShaderProgram(gl: WebGLRenderingContext): WebGLProgram {
    const vsSource = vertexShaderSource()
    const fsSource = fragmentShaderSource()
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
    const shaderProgram = gl.createProgram() as WebGLProgram
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))
    }
    return shaderProgram
}

function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type) as WebGLShader
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred while compiling a shader: " + gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
    }
    return shader
}

function vertexShaderSource(): string {
    return `attribute vec4 aVertexPosition; attribute vec4 aVertexColor;
            uniform mat4 uModelViewMatrix; uniform mat4 uProjectionMatrix;
            varying lowp vec4 vColor;
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }`
}

function fragmentShaderSource(): string {
    return `varying lowp vec4 vColor; void main(void) { gl_FragColor = vColor; }`
}

export { GL, initGl, calculateImageData, rgbToHex }
