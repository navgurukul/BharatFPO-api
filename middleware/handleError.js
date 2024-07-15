
function handleError(err,status){
    let msg = {"message": err.message};
    if(err && err.errors && status == 401){
        if(err.name && err.name == "SequelizeUniqueConstraintError"){
            let field = err['errors'][0]["path"].split("_").join(" ")
            if (field) {
                let strr = field.split("_").join(" ");
                let label = (strr.charAt(0).toUpperCase() + strr.slice(1))
                msg = {"message": `${label} already exists!`};
            } else {
                msg = {"message": "Already exits!"};
            }
        } else {
            msg = {"message": err['errors'][0]["message"]}
        } 
    }else if(err.length){
        msg = err.length && err[0].message ? {"message": err[0].message} : msg;
    }
    return msg;
}

module.exports = {
    handleError
}
