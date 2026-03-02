/**
 * Methods are returning a promise that resolves to an object containing a list of errors
 * 
 * Validation for tank capacity (max 10 digits, 2 decimal places)
 * should be  a positive number greater than 0
 * before decimal point max 8 digits
 * after decimal point max 2 digits
 * 
 * 
 * Max threshold for tank (max 8 digits, 2 decimal places)
 * should be  a positive number greater than 0
 * before decimal point max 6 digits
 * after decimal point max 2 digits
 * 
 * 
 * Min threshold for tank (max 6 digits, 2 decimal places)
 * should be  a positive number greater than 0
 * before decimal point max 4 digits
 * after decimal point max 2 digits
*/

const validateCapacity = (value) => {
    return new Promise((resolve) => {
        // const decError = [];
        // const num = Number(value);

        if (value === null || value === undefined || value === '') {
            
            return resolve({listofErrors: ['please provide a value']});
        }
        if(isNaN(value)){
            return resolve({listofErrors: ['value is not a valid number']});
        }
        
        const valueStr = String(value);
        const totalDigit = valueStr.replace('.', '');
        if(totalDigit.length > 10){
            return resolve({listofErrors: ['There are more than 10 digits']});
        }

        const decimalPart = valueStr.split('.');
        if(decimalPart.length > 2){
            return resolve({listofErrors: ['There are more than 2 decimal points']});   
        }
        if(decimalPart.length === 2 && decimalPart[1].length > 2){
            return resolve({listofErrors: ['There are more than 2 digits after the decimal']});
        }
        if (decimalPart.length === 2 && decimalPart[0].length > 8) {
            return resolve({listofErrors: ['There are more than 8 digits before the decimal']});
        }
        if (Number(value) <= 0) {
            return resolve({listofErrors: ['The value must be greater than 0']});
        }

        return resolve({listofErrors: []});
    });
}

const validateMaxThreshold = (value) => {
    return new Promise((resolve) => {

        if (value === null || value === undefined || value === '') {
            
            return resolve({listofErrors: ['please provide a value']});
        }
        if(isNaN(value)){
            return resolve({listofErrors: ['value is not a valid number']});
        }
        
        const valueStr = String(value);
        const totalDigit = valueStr.replace('.', '');
        if(totalDigit.length > 8){
            return resolve({listofErrors: ['There are more than 8 digits']});
        }

        const decimalPart = valueStr.split('.');
        if(decimalPart.length > 2){
            return resolve({listofErrors: ['There are more than 2 decimal points']});   
        }
        if(decimalPart.length === 2 && decimalPart[1].length > 2){
            return resolve({listofErrors: ['There are more than 2 digits after the decimal']});
        }
        if (decimalPart.length === 2 && decimalPart[0].length > 6) {
            return resolve({listofErrors: ['There are more than 6 digits before the decimal']});
        }
        if (Number(value) <= 0) {
            return resolve({listofErrors: ['The value must be greater than 0']});
        }

        return resolve({listofErrors: []});
    });
}

const validateMinThreshold = (value) => {
    return new Promise((resolve) => {
        if (value === null || value === undefined || value === '') {
            
            return resolve({listofErrors: ['please provide a value']});
        }
        if(isNaN(value)){
            return resolve({listofErrors: ['value is not a valid number']});
        }
        const valueStr = String(value);
        const totalDigit = valueStr.replace('.', '');
        if(totalDigit.length > 6){
            return resolve({listofErrors: ['There are more than 6 digits']});
        }
        const decimalPart = valueStr.split('.');
        if(decimalPart.length > 2){
            return resolve({listofErrors: ['There are more than 2 decimal points']});   
        }
        if(decimalPart.length === 2 && decimalPart[1].length > 2){
            return resolve({listofErrors: ['There are more than 2 digits after the decimal']});
        }
        if (decimalPart.length === 2 && decimalPart[0].length > 4) {
            return resolve({listofErrors: ['There are more than 4 digits before the decimal']});
        }
        if (Number(value) <= 0) {
            return resolve({listofErrors: ['The value must be greater than 0']});
        }

        return resolve({listofErrors: []});
    });

};

const validateThreshold = (value) => {
    return new Promise((resolve) => {

        if (value === null || value === undefined || value === '') {
            
            return resolve({listofErrors: ['please provide a value']});
        }
        if(isNaN(value)){
            return resolve({listofErrors: ['value is not a valid number']});
        }
        
        const valueStr = String(value);
        const totalDigit = valueStr.replace('.', '');
        if(totalDigit.length > 8){
            return resolve({listofErrors: ['There are more than 8 digits']});
        }

        const decimalPart = valueStr.split('.');
        if(decimalPart.length > 2){
            return resolve({listofErrors: ['There are more than 2 decimal points']});   
        }
        if(decimalPart.length === 2 && decimalPart[1].length > 2){
            return resolve({listofErrors: ['There are more than 2 digits after the decimal']});
        }
        if (decimalPart.length === 2 && decimalPart[0].length > 6) {
            return resolve({listofErrors: ['There are more than 6 digits before the decimal']});
        }
        if (Number(value) <= 0) {
            return resolve({listofErrors: ['The value must be greater than 0']});
        }

        return resolve({listofErrors: []});
    });
}


export {validateCapacity, validateMaxThreshold, validateMinThreshold, validateThreshold}