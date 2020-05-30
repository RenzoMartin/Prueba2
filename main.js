const path = require('path');

const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'view'))
app.set('view engine', 'ejs');


//middlewares

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));


//routes
app.use(require('./routes/index'));


app.listen(app.get('port'), ()=>{
    console.log('server on port',app.get('port'));
    console.log('');
});