import { Debugger } from "../debugger/debugger";

export interface IDebugInfo {
    opcode: number
    stackTop: number
    registers: Uint8Array
}

export class Renderer {

    private scale: number;
    private rows: number;
    private cols: number;

    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;

    private display: number[] = [];

    private debugDiv: HTMLDivElement;
    private debug: Debugger = null;
    private debugInfo: IDebugInfo[] = [];

    private fillColor = '#000000';

    gifs: string[] = [];

    constructor(scale: number, debug: Debugger = null) {
        this.scale = scale;
        this.rows = 32;
        this.cols = 64;
        this.debug = debug;
        this.initCanvas();
        this.initDebugCanvas();
    }

    private initCanvas() {
        this.canvas = document.getElementById('emulator') as HTMLCanvasElement;
        this.ctx = this.canvas?.getContext('2d');

        this.canvas.width = this.cols * this.scale;
        this.canvas.height = this.rows * this.scale;

        this.display = new Array(this.cols * this.rows);
    }

    private initDebugCanvas() {
        this.debugDiv = document.getElementById('debugger') as HTMLDivElement;
    }

    public addNewDebugInfo(debugInfo: IDebugInfo) {
        this.debugInfo.push(debugInfo);
    }

    public setPixel(x: number, y: number) {
        // If the numbers reach outside the boundary of display
        // we need wrap around the values to next row or column

        if (x > this.cols) {
            x -= this.cols;
        }
        if (x < 0) {
            x += this.cols;
        }

        if (y > this.rows) {
            y -= this.rows;
        }
        if (y < 0) {
            y += this.rows;
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
        this.ctx.fillStyle = this.fillColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.display.length; i++) {
            let x = (i % this.cols) * this.scale;

            let y = Math.floor(i / this.cols) * this.scale;

            if (this.display[i]) {
                this.ctx.fillStyle = '#ffffff';

                this.ctx.fillRect(x, y, this.scale, this.scale);
            }
        }
    }

    public displayDebugInfo() {
        if (this.debug) {
            // Iterate through each string in the list and draw it on canvas
            this.debug.getAllInstructions().forEach((info) => {
                const div = document.createElement('div');
                div.textContent = info.opcode.toString(16);
                div.classList.add('textItem');
                this.debugDiv.appendChild(div);
            });
        }
    }
}