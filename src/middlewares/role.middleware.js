function requireRole(...rolesPermitidos){
    return(req,res,next)=>{
        if(!req.session.user){
            return res.redirect('/login');
        }
        if(!rolesPermitidos.includes(req.session.user.rol)){
            return res.status(403).render('errors/error',{
                message:'No tienes permisos para realizar esta operacion.'
            })
        }
        next();
    }
}

module.exports = {
    requireRole,
}