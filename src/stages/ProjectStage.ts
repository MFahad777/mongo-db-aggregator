import { ProjectBuilder } from '../builders';

export class ProjectStage {
    constructor(private builder: ProjectBuilder) {}

    build(): Record<string, any> {
        return { $project: this.builder.done() };
    }
}
