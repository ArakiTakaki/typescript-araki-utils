export default class RTCManager {
  private static elVideo: HTMLVideoElement;

  private static elCanvas: HTMLCanvasElement | null;

  private static ctxCanvas: CanvasRenderingContext2D | null;

  private static width: number;

  private static height: number;

  public static init(
    audio: boolean,
    width: number,
    height: number,
    videoElement: HTMLVideoElement,
  ) {
    this.elVideo = videoElement;
    this.width = width;
    this.height = height;
    if (this.elCanvas == null || this.ctxCanvas == null) {
      const { element, context } = this.initializedCanvas();
      this.elCanvas = element;
      this.ctxCanvas = context;
    }
    navigator.getUserMedia({ audio, video: { width, height } },
      (stream: MediaStream) => {
        this.elVideo.srcObject = stream;
        this.elVideo.play();
      },
      (error: MediaStreamError) => {
        console.error(error.name);
        throw Error(error.name || 'dame');
      });
  }

  public static getByImageData() {
    return new Promise<ImageData>((resolve, reject) => {
      if (this.elCanvas == null || this.ctxCanvas == null) {
        reject(Error('error to ctxCanvas of null'));

        return;
      }
      this.ctxCanvas.drawImage(this.elVideo, 0, 0);
      resolve(this.ctxCanvas.getImageData(0, 0, this.width, this.height));
    });
  }

  public static pause() {
    this.elVideo.pause();
  }

  public static destroy() {
    if (this.elCanvas == null) {
      return;
    }
    this.elCanvas.remove();
  }

  private static initializedCanvas() {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.setAttribute('width', String(this.width));
    canvas.setAttribute('height', String(this.height));
    const ctxCanvas = canvas.getContext('2d');

    return {
      element: canvas,
      context: ctxCanvas,
    };
  }
}

