export class Speaker {
    private audioCtx;
    private gain;
    private finish;
    private oscillator: OscillatorNode = null;
    constructor() {
        const audioContext = window.AudioContext;

        this.audioCtx = new AudioContext();
        this.gain = this.audioCtx.createGain();
        this.finish = this.audioCtx.destination;


        this.gain.connect(this.finish);
    }

    public mute() {
        this.gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }

    public unmute() {
        this.gain.gain.setValueAtTime(1, this.audioCtx.currentTime);
    }

    public play(frequency: number) {
        if (this.audioCtx && !this.oscillator) {
            this.oscillator = this.audioCtx.createOscillator();
            this.oscillator.frequency.setValueAtTime(frequency || 440, this.audioCtx.currentTime);

            // square wave
            this.oscillator.type = 'square';

            this.oscillator.connect(this.gain);
            this.oscillator.start();
        }
    }

    public resume() {
        if (this.oscillator) {
            this.audioCtx.resume();
        }
    }

    public stop() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }
}