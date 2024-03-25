export class Renderer {

    private scale: number;
    private rows: number;
    private cols: number;

    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;

    private display: number[] = [];

    constructor(scale: number) {
        this.scale = scale;
        this.rows = 32;
        this.cols = 64;

        this.initCanvas();
    }

    private initCanvas() {
        this.canvas = document.getElementById('emulator') as HTMLCanvasElement;
        this.ctx = this.canvas?.getContext('2d');

        this.canvas.width = this.cols * this.scale;
        this.canvas.height = this.rows * this.scale;

        this.display = new Array(this.cols * this.rows);
    }

    public setPixel(x: number, y: number) {
        // If the numbers reach outside the boundary of display
        // we need wrap around the values to next row or column

        if (x > this.cols) {
            x = - this.cols;
        }
        if (x < 0) {
            x = + this.cols;
        }

        if (y > this.rows) {
            y = - this.rows;
        }
        if (y < 0) {
            y = + this.rows;
        }

        let pixelLocation = x + (y * this.cols);
        // according to docs we need to XOR the display value with the 1
        this.display[pixelLocation] ^= 1;
        return !this.display[pixelLocation];
    }

    public clearDisplay() {
        this.display = new Array(this.rows * this.cols);
    }


    public render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.display.length; i++) {
            let x = (i % this.cols) * this.scale;

            let y = Math.floor(i / this.cols) * this.scale;

            if (this.display[i]) {
                this.ctx.fillStyle = '#000';

                this.ctx.fillRect(x, y, this.scale, this.scale);
            }
        }
    }

}