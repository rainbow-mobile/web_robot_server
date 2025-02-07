export function errorToJson(error){
    try{
        if(error instanceof Error){
            const errorJson = {
                name: error.name,
                message: JSON.stringify(error.message),
                stack: error.stack
            }
            return JSON.stringify(errorJson);
        }else{
            const json = JSON.parse(error);
            return JSON.stringify(json);
        }
    }catch(err){
        return JSON.stringify(error);
    }
}