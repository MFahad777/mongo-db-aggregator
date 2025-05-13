export class AddFieldsStage {
    constructor(private query: object) {}

    build(): Record<string, any> {
        return { $addFields: this.query };
    }
}
