const validateTime = (value) => {
    // 6:00 AM
    return new Promise((resolve) => {
        if (value === null || value === undefined || value === '') {   
            return resolve({listofErrors: ['please provide a value']});
        }
        
        const valueStr = String(value);
        const hasSpaceAM = /\sAM$/;
        const hasSpacePM = /\sPM$/;
        const hasSpaceAnywhere = /\s/;

        
        if(valueStr.length > 8){
                    // check if contains space before AM or PM
            return resolve({listofErrors: ['Invalid time format, length is more than required']});


        }else {
            if(!hasSpaceAnywhere.test(valueStr)){
                return resolve({listofErrors: ['Invalid time format, time string deos not contain space']});
            }

            if(hasSpaceAM.test(valueStr) || hasSpacePM.test(valueStr)){
                if(valueStr.length === 8){
                    if(valueStr.split(' ')[1].length > 2){
                        return resolve({listofErrors: ['Invalid time format, meridian part is incorrect']});
                    }         
                }
                
                // split by space (one is timePart, other is ampmPart)
                const valueArray = valueStr.split(' ');
                if(valueArray.length !== 2){
                    return resolve({listofErrors: ['Invalid time format, can not allow spaces other than before AM/PM']});
                }


                let timePart = valueArray[0];
                const timeComponents = timePart.split(':');
                if(!timeComponents || timeComponents.length === 0){
                    return resolve({listofErrors: ['Invalid time format, missing time part']});
                }
                if(isNaN(timeComponents[0]) || isNaN(timeComponents[1])){
                    return resolve({listofErrors: ['Invalid time format, Time part must be a number']});
                }
                if(timeComponents.length !== 2){
                    return resolve({listofErrors: ['Invalid time format, can not have more than one colon, and only HH:MM format is allowed']});
                }
                if(timeComponents[0].length > 2 || timeComponents[1].length > 2){
                    return resolve({listofErrors: ['Invalid time format, HH or MM part exceeds length']});
                }
                if(timeComponents[0] < 1) {
                    return resolve({listofErrors: ['Invalid time format, HH part can not be less than 1']});
                }
                if(timeComponents[1] > 59) {
                    return resolve({listofErrors: ['Invalid time format, MM part exceeds 59']});
                }
                
                
                let meridianPart = valueArray[1];
                let final_timePart = 0;
                let calc_timePart = 0;

                if(timeComponents[0] > 12 && meridianPart === 'AM'){
                    return resolve({listofErrors: ['Invalid time format, HH part exceeds 12 for AM']});
                }

                if(meridianPart !== 'AM' && meridianPart !== 'PM'){
                    return resolve({listofErrors: ['Invalid time format, AM/PM part is incorrect']});
                }else if (meridianPart === 'PM'){
                    if(Number(timeComponents[0]) !== 12 && Number(timeComponents[0]) < 12){
                        calc_timePart = Number(timeComponents[0]) + 12;
                        if(timeComponents[1].length === 1){
                            timeComponents[1] = '0' + timeComponents[1];
                        }
                        final_timePart = String(calc_timePart)+':'+timeComponents[1];
                        return resolve(final_timePart)
                        
                    }else if (Number(timeComponents[0]) === 12){
                        if(timeComponents[1].length === 1){
                            timeComponents[1] = '0' + timeComponents[1];
                        }
                        calc_timePart = '12.' + timeComponents[1];
                        final_timePart = calc_timePart.split('.').join(':');
                        return resolve(final_timePart)
                    }else if (Number(timeComponents[0]) > 12){
                        if(timeComponents[1].length === 1){
                            timeComponents[1] = '0' + timeComponents[1];
                        }
                        calc_timePart = String(timeComponents[0]) + '.' + timeComponents[1];
                        final_timePart = calc_timePart.split('.').join(':');
                        return resolve(final_timePart);
                    }

                    
                }else if (meridianPart === 'AM'){
                    // calc_timePart = Number(timeComponents[0]);
                    // return resolve(final_timePart)
                    if(Number(timeComponents[0]) === 12){
                        if(timeComponents[1].length === 1){
                            timeComponents[1] = '0' + timeComponents[1];
                        }
                        calc_timePart = '00.' + timeComponents[1];
                        final_timePart = calc_timePart.split('.').join(':');
                        return resolve(final_timePart);
                    }else if (Number(timeComponents[0]) < 12){
                        timeComponents[0] = '0' + String(timeComponents[0]);
                        if(timeComponents[1].length === 1){
                            timeComponents[1] = '0' + timeComponents[1];
                        }
                        calc_timePart = timeComponents.join(':');
                        return resolve(calc_timePart);
                    }
                }
            }
            else{
                return resolve({listofErrors: ['Invalid time format, AM/PM part is incorrect']});
            }
        }
        
    });
}

export { validateTime };