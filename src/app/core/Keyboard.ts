export type KeyMap = {
    [key: number]: number;
};

export class Keyboard {

    private keyMap: KeyMap;

    private keyPressed: boolean[] = [];
    public onNextKeyPress: Function = null;

    constructor() {
        this.keyMap = {
            49: 0x1, // 1
            50: 0x2, // 2
            51: 0x3, // 3
            52: 0xc, // 4
            81: 0x4, // Q
            87: 0x5, // W
            69: 0x6, // E
            82: 0xD, // R
            65: 0x7, // A
            83: 0x8, // S
            68: 0x9, // D
            70: 0xE, // F
            90: 0xA, // Z
            88: 0x0, // X
            67: 0xB, // C
            86: 0xF  // V
        }

        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    public isKeyPressed(keyCode: number): boolean {
        return this.keyPressed[keyCode];
    }

    public onKeyDown(event: KeyboardEvent) {
        let keyCode = event.keyCode;
        let key = this.keyMap[keyCode];
        if (key) {
            this.keyPressed[key] = true;

            if (this.onNextKeyPress !== null && key) {
                this.onNextKeyPress(key);
                this.onNextKeyPress = null;
            }
        }

    }

    public onKeyUp(event: KeyboardEvent) {
        let keyCode = event.keyCode;
        let key = this.keyMap[keyCode];

        if (key) {
            this.keyPressed[key] = false;
        }
    }
}