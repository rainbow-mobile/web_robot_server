export function errorToJson(error){
    try{
        const json = JSON.parse(error);
        return JSON.stringify(json);
    }catch(err){
        const errorJson = {
            name: error.name,
            message: error.message,
            stack: error.stack
        }
        return JSON.stringify(errorJson);
    }
}