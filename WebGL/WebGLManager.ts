import Errors from '../util/Errors';
import { IGLAttributeSetting } from '../constants/interfaces';

interface ICacheShader {
  id: string;
  shader: WebGLShader;
}

export default class WebGLClass {
  element: HTMLCanvasElement;

  /* WebGLのメインコンポーネント */
  gl: WebGLRenderingContext;

  /* 幅 */
  glWidth: number;

  /* 高さ */
  glHeight: number;

  private shaderList: ICacheShader[] = [];

  /**
   * webglをコントロールするクラス
   * @param width - width
   * @param height - height
   * @param id - canvas id
   */
  public constructor(width: number, height: number, id: string) {
    const canvas = document.createElement('canvas');
    this.glWidth = width;
    this.glHeight = height;
    canvas.setAttribute('width', String(width));
    canvas.setAttribute('height', String(height));
    canvas.setAttribute('id', id);
    document.body.appendChild(canvas);
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('canvas error');
    }
    this.element = canvas;
    const webgl = this.element.getContext('webgl') || this.element.getContext('experimental-webgl');
    if (webgl == null) {
      throw new Error('webgl error');
    }
    this.gl = webgl;
  }

  public init() {
    this.gl.viewport(0, 0, this.glWidth, this.glHeight);
    this.gl.clearColor(0.5, 0.2, 0.5, 1.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT || this.gl.DEPTH_BUFFER_BIT);
  }

  public setAttribute(object: IGLAttributeSetting, index: number) {
    const { data, size } = object;
    const vbo = this.createVBO(data);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.enableVertexAttribArray(index);
    this.gl.vertexAttribPointer(index, size, this.gl.FLOAT, false, 0, 0);
  }

  public drawObject(
    uniLocation: WebGLUniformLocation | null,
    location: Float32Array,
    dataLength: number,
    size: number,
  ) {
    this.gl.uniformMatrix4fv(uniLocation, false, location);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, dataLength / size);
  }

  public flush() {
    this.gl.flush();
  }

  public createShader(vertexSource: string, id: string, type: 'vertex' | 'fragment'): WebGLShader {
    // 既存のシェーダーはキャッシュから取ってくる
    const tmp = this.shaderList.filter(item => item.id === id)[0];
    if (tmp != null) return tmp.shader;

    let shader: WebGLShader | null = null;
    switch (type) {
      case 'vertex':
        shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        break;
      case 'fragment':
        shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        break;
      default:
        shader = null;
    }
    if (shader == null) {
      throw Errors.nullPointer('not found shader');
    }
    this.gl.shaderSource(shader, vertexSource);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw this.gl.getShaderInfoLog(shader);
    }
    this.shaderList.push({
      id, shader,
    });

    return shader;
  }

  /**
     * プログラムオブジェクトの生成
     * @param vs
     * @param fs
     */
  public createProgram(vs: WebGLShader, fs: WebGLShader) {
    const program = this.gl.createProgram();
    if (program == null) {
      throw Errors.nullPointer('create program method');
    }
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw this.gl.getProgramInfoLog(program);
    }

    this.gl.useProgram(program);

    return program;
  }

  // TODO: WebGLに登録できるバッファは一つまで(らしい)
  /**
   * buffer
   * @param data
   */
  public createVBO(data: number[]) {
    const vbo = this.gl.createBuffer();
    if (vbo == null) {
      throw Errors.nullPointer('null pointer exception to ');
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
    // TODO: WebGLに登録できるバッファは一つまで(らしい)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    return vbo;
  }
}


