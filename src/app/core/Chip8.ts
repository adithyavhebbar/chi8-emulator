import { Renderer } from './Renderer';
import { Keyboard } from './Keyboard';
import { Speaker } from './Speaker';
import { RomLoaderService } from '../rom-loader.service';
import { Cpu } from './Cpu';
import { Debugger } from '../debugger/debugger';

export class Chip8 {

    private renderer: Renderer;
    private keyBoard: Keyboard;
    private debug: Debugger;

    private fpsInterval: number = 0;
    private fps: number = 60;
    private then: number = 0;
    private startTime: number = 0;
    private loop: number = 0;
    private now: number = 0;
    private elapsed: number;
    private speaker: Speaker;

    private cpu: Cpu;

    private isRomLoaded: boolean = false;
    constructor(private romLoader: RomLoaderService) {
        this.debug = null;
        this.renderer = new Renderer(10, this.debug);
        this.keyBoard = new Keyboard();
        this.speaker = new Speaker();
        this.cpu = new Cpu(this.renderer, this.speaker, this.keyBoard, this.debug);
        this.init();
    }

    public init() {
        this.fpsInterval = 1000 / this.fps;
        this.then = Date.now();
        this.startTime = this.then;

        // TESTING CODE. REMOVE WHEN DONE TESTING.
        // this.renderer.testRender();
        // this.renderer.render();
        // END TESTING CODE

        // this.speaker.play(0);

        this.loop = requestAnimationFrame(this.step.bind(this));
        this.loadRomToMemory()
    }

    private step() {
        this.now = Date.now();

        this.elapsed = this.now - this.then;
        if (this.elapsed > this.fpsInterval) {
            if (this.isRomLoaded) {
                this.cpu.cycle();
            }
        }

        this.loop = requestAnimationFrame(this.step.bind(this));
    }

    loadRomToMemory() {
        this.romLoader.getRom('chiptest.ch8').subscribe({
            next: (rom) => {
                this.cpu.loadROM(rom);
                this.isRomLoaded = true;
            },
            error: (err) => {
                console.log(err);
                throw new Error('Cannot Load ROM');
            }
        });
    }
}
