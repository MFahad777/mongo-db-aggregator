export class $Filter {
    private operator: Record<string, any> = {};

    input(expression: any): this {
        this.operator.input = expression;
        return this;
    }

    as(alias: string): this {
        this.operator.as = alias;
        return this;
    }

    cond(condition: any): this {
        this.operator.cond = condition;
        return this;
    }

    done(): Record<string, any> {
        return { $filter: this.operator };
    }
}