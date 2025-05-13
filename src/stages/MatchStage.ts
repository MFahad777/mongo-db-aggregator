export class MatchStage {
    constructor(private query: Object = {}) {}

    build(): Record<string, any> {
        return { $match: this.query };
    }
}
