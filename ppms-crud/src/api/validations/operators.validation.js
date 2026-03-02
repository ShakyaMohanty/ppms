const validate_2_2_decimal = (value) => {
    return new Promise((resolve) => {
        if (value === null || value === undefined || value === '') {
            
            return resolve({listofErrors: ['please provide a value']});
        }
        if(isNaN(value)){
            return resolve({listofErrors: ['value is not a valid number']});
        }
        const valueStr = String(value);
        const totalDigit = valueStr.replace('.', '');
        if(totalDigit.length > 4){
            return resolve({listofErrors: ['There are more than 4 digits']});
        }
        const decimalPart = valueStr.split('.');
        if(decimalPart.length > 2){
            return resolve({listofErrors: ['There are more than 2 decimal points']});   
        }
        if(decimalPart.length === 2 && decimalPart[1].length > 2){
            return resolve({listofErrors: ['cannot have more than 2 digits after the decimal']});
        }
        if (decimalPart.length === 2 && decimalPart[0].length > 2) {
            return resolve({listofErrors: ['cannot have more than 2 digits before the decimal']});
        }
        if (Number(value) <= 0) {
            return resolve({listofErrors: ['The value must be greater than 0']});
        }

        return resolve({listofErrors: []});
    });

};

const validateDate = (value) => {
    return new Promise((resolve) => {
        if (value === null || value === undefined || value === '') {   
            return resolve({listofErrors: ['please provide a value']});
        }
        const onlyTwoSlash = /^[a-zA-Z0-9]*\/[a-zA-Z0-9]*\/[a-zA-Z0-9]*$/;
        if(!onlyTwoSlash.test(value)){
            return resolve({listofErrors: ['Invalid date format, must contain only two slashes and no symbols are allowed']});
        }else{
            const dateArray = String(value).split('/');
            if(dateArray.length !== 3){
                return resolve({listofErrors: ['Invalid date format, should have month, date, and year']});
            }
            if(isNaN(dateArray[0]) || isNaN(dateArray[1]) || isNaN(dateArray[2])){
                return resolve({listofErrors: ['Month, date, and year must be numbers']});
            }
            if(dateArray[0].length > 2 || dateArray[1].length > 2 || dateArray[2].length !== 4){
                return resolve({listofErrors: ['Invalid month or date or year length']});
            }
            if(dateArray[0] < 1 || dateArray[0] > 12 ){
                return resolve({listofErrors: ['Month must be between 1 and 12']});
            }
            if(dateArray[1] < 1 || dateArray[1] > 31 ){
                return resolve({listofErrors: ['Date must be between 1 and 31']});
            }
            if(dateArray[2] < 2000 ){
                return resolve({listofErrors: ['Year must be greater than 2000']});
            }
            let dateValue = new Date(value);
            const formattedDate = dateValue.getFullYear()+"-"+(dateValue.getMonth()+1)+"-"+dateValue.getDate(); 
            return resolve(formattedDate);
        }


        // const dateFormatRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])\/\d{4}$/;
        // if (!dateFormatRegex.test(value)) {
        //     return resolve({listofErrors: ['Invalid date format. Use MM/DD/YYYY.']});
        // }


    });
}
export { validate_2_2_decimal, validateDate };