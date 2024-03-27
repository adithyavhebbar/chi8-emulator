import { throwError } from "rxjs";
import { Stack } from "../utils/Stack";
import { Keyboard } from "./Keyboard";
import { Renderer } from "./Renderer";
import { Speaker } from "./Speaker";
import { Debugger } from "../debugger/debugger";

export class Cpu {
    private renderer: Renderer;
    private speaker: Speaker;
    private keyBoard: Keyboard;

    private debug: Debugger;

    private memory: Uint8Array;
    private registers: Uint8Array;
    private i: number;

    private delayTimer: number;
    private soundTimer: number;

    private programCounter: number;
    private stack: Stack<number>;

    // Flag is true if the instructions are paused
    private paused: boolean = false;
    private speed: number = 5;

    private startingAddress: number;
    constructor(renderer: Renderer, speaker: Speaker, keyBoard: Keyboard, debug: Debugger = null) {
        this.renderer = renderer;
        this.keyBoard = keyBoard;
        this.speaker = speaker;

        this.debug = debug;

        // Chip8 has 4096 (4KB) bytes of RAM/Memory
        this.memory = new Uint8Array(4096);

        // 8 set of 16bit registers
        this.registers = new Uint8Array(16);

        // To store memory address
        this.i = 0;

        // Timers
        this.delayTimer = 0;
        this.soundTimer = 0;

        // Program counter. Stores the address of the currently executing instruction. In chip8 program begins at 0x200 address
        this.programCounter = 0x200;
        this.startingAddress = 0x200;

        // Stack to store the addresses
        this.stack = new Stack<number>();
    }

    public loadSprites() {
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];

        for (let i = 0; i < sprites.length; i++) {
            this.memory[i] = sprites[i];
        }
    }

    public loadProgram(program: Uint8Array) {
        for (let i = 0; i < program.length; i++) {
            this.memory[this.startingAddress + i] = program[i];
        }
    }

    public loadROM(rom: ArrayBuffer) {
        let program = new Uint8Array(rom);

        this.loadProgram(program);
    }

    public cycle() {
        for (let i = 0; i < this.speed; i++) {
            if (!this.paused) {
                let opcode = (this.memory[this.programCounter] << 8 | this.memory[this.programCounter + 1]);
                // if (this.debug) {
                //     this.debug.addInstruction({
                //         opcode: opcode,
                //         registers: this.registers.slice(),
                //         stackTop: this.stack.peek()
                //     });
                // }
                this.executeInstruction(opcode)
            }
        }

        if (!this.paused) {
            this.updateTimers();
        }

        this.playSound();
        this.renderer.render();
        if (this.debug) {
            this.renderer.displayDebugInfo();
        }
    }

    public executeInstruction(opcode: number) {
        try {

            this.programCounter += 2;

            // if (this.programCounter > this.memory.length) {
            //     this.programCounter = this.startingAddress;
            // }

            // We only need the 2nd nibble, so grab the value of the 2nd nibble and shift it right 8 bits to get rid of everything but that 2nd nibble.
            let x = (opcode & 0x0F00) >> 8;

            // We only need the 3rd nibble, so grab the value of the 3rd nibble and shift it right 4 bits to get rid of everything but that 3rd nibble.
            let y = (opcode & 0x00F0) >> 4;

            switch (opcode & 0xF000) {
                case 0x0000:
                    switch (opcode) {
                        case 0x00E0:
                            this.renderer.clearDisplay();
                            break;
                        case 0x00EE:
                            let returnAdd = this.stack.remove();
                            this.programCounter = returnAdd;
                            break;
                        default:
                            break;
                    }
                    break;
                case 0x1000:
                    this.programCounter = opcode & 0x0FFF;
                    break;
                // 0x2nnn: push the current PC to the top of stack and call the subroutine at nnn
                case 0x2000:
                    this.stack.add(this.programCounter);
                    this.programCounter = opcode & 0x0FFF;
                    break;
                // 3xkk: Skip next instruction if Vx == kk
                case 0x3000:
                    let kk = opcode & 0x00FF;
                    if (this.registers[x] === kk) {
                        this.programCounter += 2;
                    }
                    break;
                // 4xkk: Skip next instruction if Vx != kk.
                case 0x4000:
                    if (this.registers[x] !== (opcode & 0x00FF)) {
                        this.programCounter += 2;
                    }
                    break;
                // 5xy0: Skip next instruction if Vx = Vy.
                case 0x5000:
                    if (this.registers[x] === this.registers[y]) {
                        this.programCounter += 2;
                    }
                    break;
                // 6xkk: Set Vx = kk
                case 0x6000:
                    this.registers[x] = (opcode & 0x00FF);
                    break;
                // 7xkk: Set Vx = Vx + kk.
                case 0x7000:
                    this.registers[x] = this.registers[x] + (opcode & 0x00FF);
                    break;
                case 0x8000:
                    switch (opcode & 0x000F) {
                        // Set Vx = Vy.
                        case 0x0000:
                            this.registers[x] = this.registers[y];
                            break;
                        // Set Vx = Vx OR Vy.
                        case 0x0001:
                            this.registers[x] = this.registers[x] | this.registers[y];
                            break;
                        // 8xy2 - AND Vx, Vy
                        case 0x0002:
                            this.registers[x] = this.registers[x] & this.registers[y];
                            break;
                        // 8xy3 - XOR Vx, Vy
                        case 0x0003:
                            this.registers[x] = this.registers[x] ^ this.registers[y];
                            break;
                        // 8xy4 - ADD Vx, Vy
                        case 0x0004:
                            this.registers[0xF] = 0;
                            // If the result is > 8 bit i.e 255 then set VF (carry) to 1
                            if (this.registers[x] + this.registers[y] > 0xFF) {
                                this.registers[0xF] = 1;
                            }
                            this.registers[x] += this.registers[y];
                            break;
                        // 8xy5 - SUB Vx, Vy
                        // Set Vx = Vx - Vy, set VF = NOT borrow
                        // If Vx > Vy, then VF is set to 1, otherwise 0.
                        case 0x0005:
                            this.registers[0xF] = 0;
                            if (this.registers[x] > this.registers[y]) {
                                this.registers[0xF] = 1;
                            }
                            this.registers[x] -= this.registers[y];

                            break;
                        // 8xy6 - SHR Vx {, Vy}
                        // Shift right Vx by 1;
                        case 0x0006:
                            this.registers[0xF] = (this.registers[x] & 0x1);

                            this.registers[x] >> 1;
                            break;
                        // 8xy7 - SUBN Vx, Vy
                        // Set Vx = Vy - Vx, set VF = NOT borrow.
                        case 0x0007:
                            this.registers[0xF] = 0;

                            if (this.registers[y] > this.registers[x]) {
                                this.registers[0xF] = 1;
                            }
                            this.registers[x] = this.registers[y] - this.registers[x];
                            break;
                        // 8xyE - SHL Vx {, Vy}
                        // Set Vx = Vx SHL 1.
                        case 0x000E:
                            this.registers[0xF] = (this.registers[x] & 0x80);
                            this.registers[x] = this.registers[x] << 1;
                            break;
                    }
                    break;
                case 0x9000:
                    if (this.registers[x] !== this.registers[y]) {
                        this.programCounter += 2;
                    }
                    break;
                case 0xA000:
                    this.i = (opcode & 0x0FFF);
                    break;
                // Bnnn - JP V0, addr
                // Jump to location nnn + V0.
                case 0xB000:
                    this.programCounter = (opcode & 0x0FFF) + this.registers[0];
                    break;
                // Cxkk - RND Vx, byte
                // Set Vx = random byte AND kk
                case 0xC000:
                    let rand = Math.floor(Math.random() * 0xFF);
                    this.registers[x] = rand & (opcode & 0xFF);
                    break;
                // Dxyn - DRW Vx, Vy, nibble
                // Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
                case 0xD000:
                    // Each sprite is 8 pixel wide
                    let width = 8;
                    let height = (opcode & 0x000F);

                    this.registers[0xF] = 0;
                    for (let row = 0; row < height; row++) {
                        let sprite = this.memory[this.i + row];

                        for (let col = 0; col < width; col++) {
                            if ((sprite & 0x80) > 0) {
                                if (this.renderer.setPixel(this.registers[x] + col, this.registers[y] + row)) {
                                    this.registers[0xF] = 1;
                                }
                            }
                            sprite = sprite << 1;
                        }
                    }
                    break;
                case 0xE000:
                    switch (opcode & 0x00FF) {
                        case 0x009E:
                            if (this.keyBoard.isKeyPressed(this.registers[x])) {
                                this.programCounter += 2;
                            }
                            break;
                        case 0x00A1:
                            if (!this.keyBoard.isKeyPressed(this.registers[x])) {
                                this.programCounter += 2;
                            }
                            break;
                    }
                    break;
                case 0xF000:
                    switch (opcode & 0x00FF) {
                        case 0x07:
                            this.registers[x] = this.delayTimer;
                            break;
                        case 0x0A:
                            this.paused = true;
                            this.keyBoard.onNextKeyPress = (key: number) => {
                                this.registers[x] = key;
                                this.paused = false;
                            }
                            break;
                        case 0x15:
                            this.delayTimer = this.registers[x];
                            break;
                        case 0x18:
                            this.soundTimer = this.registers[x];
                            break;
                        case 0x1E:
                            this.i = this.i + this.registers[x];
                            break;
                        case 0x29:
                            // Sprites are 5 bytes long
                            this.i = this.registers[x] * 5;
                            break;
                        case 0x33:
                            this.memory[this.i] = this.registers[x] / 100;
                            this.memory[this.i + 1] = (this.registers[x] % 100) / 10;
                            this.memory[this.i + 2] = (this.registers[x] % 10);
                            break;
                        case 0x55:
                            for (let ri = 0; ri <= x; ri++) {
                                this.memory[this.i + ri] = this.registers[ri]
                            }
                            break;
                        case 0x65:
                            for (let ri = 0; ri <= x; ri++) {
                                this.registers[ri] = this.memory[this.i + ri]
                            }
                            break;
                    }
                    break;
                default:
                    throw new Error("Unknown Instrunction " + opcode);
            }
        } catch (e) {
            console.log('Erro ', e)
        }
    }

    public updateTimers() {
        if (this.delayTimer > 0) {
            this.delayTimer -= 1;
        }

        if (this.soundTimer > 0) {
            this.soundTimer -= 1;
        }
    }

    public playSound() {
        if (this.soundTimer > 0) {
            this.speaker.play(400);
        } else {
            this.speaker.stop();
        }
    }
}