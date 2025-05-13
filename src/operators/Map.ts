export class $Map {
    private operator: Record<string, any> = {};

    input(expression: any): this {
        this.operator.input = expression;
        return this;
    }

    as(alias: string): this {
        this.operator.as = alias;
        return this;
    }

    in(expression: any): this {
        this.operator.in = expression;
        return this;
    }

    done(): Record<string, any> {
        return { $map: this.operator };
    }
}