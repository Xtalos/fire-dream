export const formatValue = (value:string|number,unit='EUR') => {
    if(typeof value === 'string') {
        value = parseFloat(value);
    }
    value = isNaN(value) ? 0 : value;

    return Math.round(value * 100) / 100;
}