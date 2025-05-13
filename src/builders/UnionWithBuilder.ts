export class UnionWithBuilder {
    private unionWithStage: Record<string, any> = {};

    constructor(collectionName: string) {
        this.unionWithStage.unionWith = { coll: collectionName };
    }

    pipeline(stages: Record<string, any>[]): this {
        this.unionWithStage.unionWith.pipeline = stages;
        return this;
    }

    done(): Record<string, any> {
        return { $unionWith: this.unionWithStage.unionWith };
    }
}
