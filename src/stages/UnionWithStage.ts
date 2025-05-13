import { UnionWithBuilder } from "../builders";

export class UnionWithStage {
    private builder: UnionWithBuilder;

    constructor(builder: UnionWithBuilder) {
        this.builder = builder;
    }

    build(): Record<string, any> {
        return this.builder.done();
    }
}
