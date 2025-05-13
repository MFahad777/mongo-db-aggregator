export class FacetBuilder {
    private facets: Record<string, any[]> = {};

    add(name: string, stages: any[]): this {
        this.facets[name] = stages;
        return this;
    }

    done(): Record<string, any> {
        return this.facets;
    }
}