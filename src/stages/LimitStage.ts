export class LimitStage {
    constructor(private value: number) {}

    build(): Record<string, any> {
        return { $limit: this.value };
    }
}
