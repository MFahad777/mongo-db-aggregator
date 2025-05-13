import { GroupBuilder } from '../builders';

export class GroupStage {
    constructor(private builder: GroupBuilder) {}

    build(): Record<string, any> {
        return { $group: this.builder.done() };
    }
}
