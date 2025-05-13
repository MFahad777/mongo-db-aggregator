export class LookupBuilder {
    private lookup: Record<string, any> = {};

    from(collection: string): this {
        this.lookup.from = collection;
        return this;
    }

    localField(field: string): this {
        this.lookup.localField = field;
        return this;
    }

    foreignField(field: string): this {
        this.lookup.foreignField = field;
        return this;
    }

    as(alias: string): this {
        this.lookup.as = alias;
        return this;
    }

    let(vars: Record<string, string>): this {
        this.lookup.let = vars;
        return this;
    }

    pipeline(pipeline: any[]): this {
        this.lookup.pipeline = pipeline;
        return this;
    }

    done(): Record<string, any> {
        return this.lookup;
    }
}