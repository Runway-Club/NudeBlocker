import {Queue} from "./Queue";
import {ClassifyTask} from "./ClassifyTask";

export class Engine {
    private jobQueue: Queue<ClassifyTask>;

    constructor() {
        this.jobQueue = new Queue<ClassifyTask>();
    }

}