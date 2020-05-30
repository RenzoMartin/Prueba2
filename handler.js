handler = {};


handler.comun = function (req, res){
    
    const baseHerbrand = req.body.inputBase.split(',');
    const clausulasDelPrograma = crearClausulas(req.body.inputProg.split('/'));
    const consecLogic = crearClausulas(req.body.consec.split('/'));
    
    const tablaDeVerdad = crearTabla(baseHerbrand);

    var interpretacionesHerbrand = crearInterpretaciones(tablaDeVerdad);

    var resFinal = [];
    var resFinalNo = [];
    
    crearModelos(resFinal, resFinalNo, interpretacionesHerbrand, clausulasDelPrograma);

    var consecuenciasLogicas = crearConsecuencias(resFinal, consecLogic, baseHerbrand);
    var consecuenciasLogicas2 = formatConsec(consecuenciasLogicas);

    res.render('index2', {
        interModel : resFinal,
        noInterModel : resFinalNo,
        base : baseHerbrand,
        interpretaciones : interpretacionesHerbrand,
        consecLogic : consecuenciasLogicas2
    })
}


handler.avanzado = function(req, res){

}

function formatConsec(consecuenciasLogicas){
    var consecuencias = {
        validas : []
    }

    consecuenciasLogicas.validas.forEach(cl =>{

        var formato = '';

        cl.cabeza.forEach((atomo, index)=>{
            formato = formato + atomo + ';';
        });

        formato = formato + ' :- ';

        cl.cuerpo.forEach((atomo,index) =>{
            formato = formato + atomo + ','; 
        });

        consecuencias.validas.push(formato);
    })

    console.log(consecuencias);

    return consecuencias;
}

function crearClausulas(clausulasPrograma){
    var clausulasDelPrograma = [];

    clausulasPrograma.forEach(clausula=>{
        const cabAux = clausula.split(':');

        if(cabAux[1]){
            cabAux[1] = cabAux[1].slice(1,cabAux[1].length); //arreglo el error del :-
        }else{
            cabAux.push('');
        }

        clausulasDelPrograma.push({
            cabeza : cabAux[0].split(';'),
            cuerpo : cabAux[1].split(',')
        });
    })

    return clausulasDelPrograma;
}

function crearInterpretaciones(tablaDeVerdad){
    var interpretacionesHerbrand = [];

    for (let fila = 0; fila < tablaDeVerdad[0].length; fila++) {

        var interpretacion = {
            atomosVerdaderos : [],
            atomosFalsos : []
        }
        
        for(let col = 0; col < tablaDeVerdad.length; col++){
            var objeto = tablaDeVerdad[col][fila];

            if(objeto.valor){
                interpretacion.atomosVerdaderos.push(objeto.atomo);
            }else{
                interpretacion.atomosFalsos.push(objeto.atomo);
            }
        }

        interpretacionesHerbrand.push(interpretacion);
    }

    return interpretacionesHerbrand;
}

function crearModelos(resFinal, resFinalNo, interpretacionesHerbrand, clausulasDelPrograma){
    interpretacionesHerbrand.forEach(interpretacion =>{

        var resCab;
        var resCuer;

        var cumple = true;

        clausulasDelPrograma.forEach(clausula =>{

            var clausulaCabeza = new Set(clausula.cabeza);
            var clausulaCuerpo = new Set(clausula.cuerpo);

            var interVerdaderos = new Set(interpretacion.atomosVerdaderos);
            var interFalsos = new Set(interpretacion.atomosFalsos);

            var interCabeza = new Set([...interVerdaderos].filter(x => clausulaCabeza.has(x)));
            var interCuerpo = new Set([...interFalsos].filter(x => clausulaCuerpo.has(x)));

            interCabeza = Array.from(interCabeza);
            interCuerpo = Array.from(interCuerpo);

            if((interCabeza.length == 0) && (interCuerpo.length == 0)){
                cumple = false;
            }

        });

        var interAux = '('+interpretacion.atomosVerdaderos.join()+')'

        if(cumple){
            resFinal.push(interAux)
        }else{
            resFinalNo.push(interAux);
        }
    })
}

function crearConsecuencias(modelos, consecLogics, baseH){
    var consecuenciasLogicas = {
        validas : [],
        noValidas : []
    }

    var modelosPrograma = formatearModel(modelos, baseH);

    consecLogics.forEach((consecLogic)=>{

        var consecCabeza = new Set(consecLogic.cabeza);
        var consecCuerpo = new Set(consecLogic.cuerpo);

        var cumple = true;

        modelosPrograma.forEach((modelo)=>{
            
            var modeloVerdaderos = new Set(modelo.atomosVerdaderos);
            var modeloFalsos = new Set(modelo.atomosFalsos);

            var interCabeza = new Set([...modeloVerdaderos].filter(x => consecCabeza.has(x)));
            var interCuerpo = new Set([...modeloFalsos].filter(x => consecCuerpo.has(x)));

            interCabeza = Array.from(interCabeza);
            interCuerpo = Array.from(interCuerpo);

            if((interCabeza.length == 0) && (interCuerpo.length == 0)){
                cumple = false;
            }
        });

        if(cumple){
            consecuenciasLogicas.validas.push(consecLogic)
        }else{
            consecuenciasLogicas.noValidas.push(consecLogic);
        }
    })

    return consecuenciasLogicas;
}

function formatearModel(modelos, baseH){

    var modelosDePrograma = [];

    var baseHConj = new Set(baseH);

    modelos.forEach(modelo =>{
        var model = {
            atomosVerdaderos : [],
            atomosFalsos : []
        }

        var modAux = modelo.slice(1, modelo.length -1);

        var atomosVerdaderos = new Set(modAux.split(','));

        var atomosFalsos = new Set([...baseHConj].filter(x =>{ return !atomosVerdaderos.has(x)}));

        model.atomosVerdaderos = Array.from(atomosVerdaderos);
        model.atomosFalsos = Array.from(atomosFalsos);

        modelosDePrograma.push(model);
    });

    return modelosDePrograma;
}


const crearTabla = (baseH)=>{
    nCol = baseH.length;
    nFil = Math.pow(2, nCol);

    var m = crearMatrizVacia(nFil, nCol, baseH);

    for (let col = 0; col < nCol; col++) {

        val = false;

        tope = Math.floor((nFil / (Math.pow(2, (col +1))))); //me dice cada cuantos hay que cambiar

        posActual = 0;

        for (let fil = 0; fil < nFil; fil++) {

            if(posActual == tope){
                val = !val;
                posActual = 0;
            }

            posActual ++;

            m[col][fil] = {
                valor : val,
                atomo : baseH[col]
            };


        }
    }

    return m;
}

function crearMatrizVacia(nFil, nCol, baseH){
    var m = [];
    for (let i = 0; i < nCol; i++) {
        
        var m2 = [];

        for (let j = 0; j < nFil; j++) {
            m2.push({
                valor : false,
                atomo : baseH[i]
            });
        }

        m.push(m2);
    }

    return m;
}

module.exports = handler;