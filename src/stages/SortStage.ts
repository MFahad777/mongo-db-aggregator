export class SortStage {
    constructor(private query: Record<string, any>) {}

    build(): Record<string, any> {
        return { $sort: this.query };
    }
}
