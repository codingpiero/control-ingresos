const authService = require('../services/auth.services');

function loginForm(req,res){
    res.render('login',{
        title:'Iniciar Sesion',
        error:null
    });
}

async function login(req,res,next){
    try {
        const {username,password} = req.body;
        if(typeof username !== 'string' ||
            typeof password !== 'string'||
            !username.trim()||
            !password
        ){
            return res.status(400).render('login',{
                title:'Iniciar Sesion',
                error:'Ingresa tu usuario y contraseña.'
            })
        }
        const user = await authService.login(username.trim(),password);
        if(!user){
            return res.status(401).render('login',{
                title:'Iniciar Sesion',
                error:'Usuario o contraseña  incorrectos.'
            });
        }
        req.session.user = user;
        req.session.save((error)=>{
            if(error)
                return next(error);
            return res.redirect('/');
        })
    } catch (e) {
        next(e);
    }
}

function logout(req,res,next){
    req.session.destroy((error)=>{
        if(error)
            return next(error);
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
}

module.exports = {
    loginForm,
    login,
    logout
}