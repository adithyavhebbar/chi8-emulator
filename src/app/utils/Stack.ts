export class Stack<T> {
    private stack: T[] = [];

    constructor(values: T[] = []) {
        this.stack = values;
    }

    /**
     * 
     * @param value Element to be added to the top of the stack.
     * Adds the value to the top of the stack
     */
    public add(value: T): void {
        this.stack.push(value);
    }

    /**
     * Inspect the element at the top of the stack. This operation will not remove the element at the top of the stack
     */
    public peek(): T {
        return this.stack[this.stack.length - 1];
    }

    /**
     * Retrieve the element at the top of the stack. This operation will remove the element at the top and return the element
     */
    public remove(): T {
        const topElement = this.stack.slice(this.stack.length - 1, 1);
        return topElement[0];
    }

    public isEmpty(): boolean {
        return this.stack.length === 0;
    }
}