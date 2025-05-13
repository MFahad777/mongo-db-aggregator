export class GroupBuilder {
    private readonly group: Record<string, any>;

    constructor(id: any = null) {
        this.group = { _id: id };
    }

    add(field: string, expr: any): this {
        this.group[field] = expr;
        return this;
    }

    done(): Record<string, any> {
        return this.group;
    }
}