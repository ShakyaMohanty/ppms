const isDecimal10_2 = (value) => {
    const decError = {listofErrors: []};

    if (isNaN(value)|| value === null || value === undefined || value === '') {
        decError.listofErrors.push('please provide a value');
    }
    
    const valueStr = String(value);
    const totalDigit = valueStr.replace('.', '');
    if(totalDigit.length > 10){
        decError.listofErrors.push('There are more than 10 digits');
    }

    const decimalPart = valueStr.split('.');
    if(decimalPart.length > 2){
        decError.listofErrors.push('There are more than 2 decimal points');
    }
    if(decimalPart.length === 2 && decimalPart[1].length > 2){
        decError.listofErrors.push('There are more than 2 digits after the decimal');
    }
    if (decimalPart.length === 2 && decimalPart[0].length > 8) {
        decError.listofErrors.push('There are more than 8 digits before the decimal');
    }
     if (Number(value) <= 0) {
        decError.listofErrors.push('The value must be greater than 0');
    }
    return decError;
}

export {isDecimal10_2}