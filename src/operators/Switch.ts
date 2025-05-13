export class $Switch {
    private operator: Record<string, any> = {
        branches: [],
        default: null
    };

    branch(condition: any, then: any): this {
        this.operator.branches.push({
            case: condition,
            then: then
        });
        return this;
    }

    default(value: any): this {
        this.operator.default = value;
        return this;
    }

    done(): Record<string, any> {
        return { $switch: this.operator };
    }
}