import {Model, PipelineStage, AggregateOptions} from 'mongoose';
import {PaginationOptions, paginate} from "./helpers/paginate";

type MacroFunction = () => Record<string, any> | Record<string, any>[];

type AggBuilder<T> = Omit<AggregatorBuilder<T>, 'exec' | 'toJSON'>;

export class AggregatorBuilder<T> {
    private pipeline: Object[] = [];

    private static macros: Record<string, MacroFunction> = {};

    constructor(private model: Model<T>, private aggregationOptions: AggregateOptions = {}) {
    }

    static registerMacro(name: string, macroFn: MacroFunction): void {
        if (!name) {
            throw new Error(`name is required`)
        }

        if (!macroFn) {
            throw new Error(`macro function is required`)
        }

        const macro = AggregatorBuilder.getMacro(name);

        if (macro) {
            throw new Error(`Macro with name ${name} already exists`)
        }

        this.macros[name] = macroFn;
    }

    static getMacro(name: string): MacroFunction | undefined {
        return this.macros[name];
    }

    useMacro(name: string): this {
        const macro = AggregatorBuilder.getMacro(name);

        if (!macro) throw new Error(`Macro "${name}" not found.`);

        const result = macro();

        if (Array.isArray(result)) {
            this.pipeline.push(...result);
        } else {
            this.pipeline.push(result);
        }

        return this;
    }

    toJSON(): Record<string, any>[] {
        return this.pipeline;
    }

    match(query: PipelineStage | object) {
        this.pipeline.push({$match: query});
        return this;
    }

    sort(query: object) {
        this.pipeline.push({$sort: query});
        return this;
    }

    project(query: object) {
        this.pipeline.push({$project: query});
        return this;
    }

    group(query: object) {
        this.pipeline.push({$group: query});
        return this;
    }

    lookup(query: object) {
        this.pipeline.push({$lookup: query});
        return this;
    }

    unwind(query: string | object) {
        const value = typeof query === 'string' ? {path: query} : query;
        this.pipeline.push({$unwind: value});
        return this;
    }

    limit(value: number) {
        this.pipeline.push({$limit: value});
        return this;
    }

    skip(value: number) {
        this.pipeline.push({$skip: value});
        return this;
    }

    set(query: object) {
        this.pipeline.push({$set: query});
        return this;
    }

    replaceRoot(query: object) {
        this.pipeline.push({$replaceRoot: query});
        return this;
    }

    facet(query: object) {
        this.pipeline.push({$facet: query});
        return this;
    }

    merge(query: object) {
        this.pipeline.push({$merge: query});
        return this;
    }

    raw(stage: PipelineStage) {
        this.pipeline.push(stage);
        return this;
    }

    unionWith(query: object) {
        this.pipeline.push({$unionWith: query});
        return this;
    }

    paginate(options: PaginationOptions) {
        this.pipeline.push(...paginate(options));
        return this;
    }

    cond(condition : Function | boolean, callback : (builder: AggBuilder<T>) => void) {
        const shouldApply = typeof condition === 'function' ? condition() : condition;

        if (shouldApply) {
            callback(this as AggBuilder<T>);
        }

        return this;
    }

    exec() {
        return this.model.aggregate(this.pipeline as PipelineStage[], this.aggregationOptions);
    }
}