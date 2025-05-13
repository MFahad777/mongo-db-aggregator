export class ProjectBuilder {
    private projection: Record<string, any> = {};

    add(field: string, value: any): this {
        this.projection[field] = value;
        return this;
    }

    done(): Record<string, any> {
        return this.projection;
    }
}