export class Debugger {
    private executedInstructions: string[] = [];

    constructor(instructions: string[] = []) {
        this.executedInstructions = instructions;
    }

    public addInstruction(instruction: string) {
        this.executedInstructions.push(instruction);
    }

    public getAllInstructions(): string[] {
        return this.executedInstructions;
    }
}