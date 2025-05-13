export class $Reduce {
    private operator: Record<string, any> = {};

    input(expression: any): this {
        this.operator.input = expression;
        return this;
    }

    initialValue(value: any): this {
        this.operator.initialValue = value;
        return this;
    }

    in(expression: any): this {
        this.operator.in = expression;
        return this;
    }

    done(): Record<string, any> {
        return { $reduce: this.operator };
    }
}
