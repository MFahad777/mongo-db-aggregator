import { AggregatorBuilder } from './AggregatorBuilder';
import { AggregateOptions } from "mongoose";
export function aggregator<T>(model: any, aggregationOptions: AggregateOptions = {}) {
    return new AggregatorBuilder<T>(model, aggregationOptions);
}
export { AggregatorBuilder as AggregatorClass };