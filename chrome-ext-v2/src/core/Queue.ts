export class Queue<T> {
    private queue: T[];
    constructor() {
        this.queue = [];
    }
    enqueue(item:T) {
        this.queue.push(item);
    }
    dequeue():T|undefined{
        return this.queue.shift();
    }
    clear() {
        this.queue = [];
    }
    get length() {
        return this.queue.length;
    }
}