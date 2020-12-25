export function escapeString(str: string) {
    return str.replace(/(\\|")/g, '\\$1')
}

export function quoteString(str: string) {
    return `"${escapeString(str)}"`
}

export function objMap<U, V>(obj: {[k: string]: U}, fn: (v: U) => V): {[k: string]: V} {
    return Object.keys(obj).reduce((o, k) => ({...o, [k]: fn(obj[k])}), {})
}
