export class $Cond {
    private operator: Record<string, any> = {
        if: null,
        then: null,
        else: null
    };

    if(condition: any): this {
        this.operator.if = condition;
        return this;
    }

    then(value: any): this {
        this.operator.then = value;
        return this;
    }

    else(value: any): this {
        this.operator.else = value;
        return this;
    }

    done(): Record<string, any> {
        return { $cond: this.operator };
    }
}
