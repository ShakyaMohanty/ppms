// how to get param's value from search 
// example: http://localhost:8080/user?name=shakya
// expected output: shakya
// const urlParams = new URLSearchParams(window.location.search)
// console.log(urlParams.get(name))





// difference between path, __filename and __dirname in common js and module js
//  --- for module js (there are two way)
// the legacy way:
import path from 'path';
import { fileURLToPath } from 'url';
console.log(path.dirname(fileURLToPath(import.meta.url)))
// the new way:
console.log(import.meta.filename);
console.log(import.meta.dirname);


//  --- for common js (my package.json setting is module, so it might not work here)
// console.log(__dirname)
// console.log(__filename)