export class UnwindBuilder {
    private unwind: Record<string, any> = {};

    path(path: string): this {
        this.unwind.path = path;
        return this;
    }

    preserveNullAndEmptyArrays(flag: boolean = true): this {
        this.unwind.preserveNullAndEmptyArrays = flag;
        return this;
    }

    done(): Record<string, any> {
        return this.unwind;
    }
}