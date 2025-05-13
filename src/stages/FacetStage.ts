import { FacetBuilder } from '../builders';

export class FacetStage {
    constructor(private query: FacetBuilder) {}

    build(): { $facet: Record<string, any> } {
        return {
            $facet: this.query.done(),
        };
    }
}