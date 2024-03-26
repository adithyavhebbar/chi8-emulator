import { IDebugInfo } from "../core/Renderer";

export class Debugger {
    private executedInstructions: IDebugInfo[] = [];

    constructor(instructions: IDebugInfo[] = []) {
        this.executedInstructions = instructions;
    }

    public addInstruction(instruction: IDebugInfo) {
        this.executedInstructions.push(instruction);
    }

    public getAllInstructions(): IDebugInfo[] {
        return this.executedInstructions;
    }
}