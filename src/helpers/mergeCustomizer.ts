export function mergeCustomizer(objValue: any, srcValue: any) {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) {
        return [...objValue, ...srcValue];
    }
}