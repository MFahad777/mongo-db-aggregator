export class SkipStage {
    constructor(private value: number) {}

    build(): Record<string, any> {
        return { $skip: this.value };
    }
}
