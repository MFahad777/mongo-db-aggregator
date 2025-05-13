import { UnwindBuilder } from '../builders';

export class UnwindStage {
    constructor(private builder: UnwindBuilder) {}

    build(): Record<string, any> {
        return { $unwind: this.builder.done() };
    }
}
