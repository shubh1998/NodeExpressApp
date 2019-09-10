const express = require('express');
const con = require('./model/Db');
const mysql = require('mysql');

const session=require('express-session');

const app = express();

//Create and start server

/* app.listen(3000 , function(){
     console.log("Server Started....");
});
*/

app.listen(3000 , () => {
    console.log("Server Started....");
});

app.use(session({secret:"1234567"}))
//To serve Static Content
app.use(express.static('public'));

//Configure view engine : hbs
// var path = require('path');
// app.set('views' , path.join(__dirname , 'views')); // Give Location
// //console.log(path.join(__dirname , 'views')); //To see path of file view
// app.set('view engine', 'hbs'); // Give Extension
var hbs= require('express-handlebars');
app.engine('hbs' , hbs({
    extname: 'hbs',
    defaultLayout: 'mainLayout',
    layoutsDir: __dirname + '/views/layouts/'
}));
app.set('view engine' , 'hbs');




// caching disabled for every route//////////////////////////////
app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store,must-revalidate,max-stale=0, post-check=0, pre-check=0');
    next();
});


app.get('/' , (request , response) => {
    //response.end("<h1>Hello Node JS..</h1>");
    //Transfer request to html page
    response.render('index'); //Here Two doubts - (1)Extension, (2)location
});

//Configure body-parser
const bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended:true
}));


/*------------------------------------ Node Mailer ---------------------------------------*/

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'youremailid@gmail.com' ,
        pass: 'yourpassword'
    }
});


/*-----------------------------------------------------------------------------------------*/




////////////////////////////////////////////////////////////////
app.get('/DeleteEmp',(request,response)=>{
    var eid=request.query.empid;                          //Query String
    var sql="delete from employee where eid="+eid;
    con.query(sql,(err)=>{
      if(err) throw err;
      else{
        var sql="select * from employee";
        con.query(sql,(err,result)=>{
          if(err) throw err;
          else
          response.render('viewemps',{data:result,msg:"Data Deleted"}); //1) extention 2) location
        });
    
    }
    });
    
    
    
    });
    
    
    
    app.get('/home',(request,response)=>{
      response.render('home',{user:request.session.user});
    });
    
    app.get('/createemp',(request,response)=>{
    response.render('newemp',{user:request.session.user}); //1) extention 2) location
    });
    
    ////////////////////////////////////////////////////////////////


app.get('/Viewemp' , (request, response) => {
 
    if(request.session.user)
    {
    var sql="select * from employee";
    con.query(sql , (err , result) => {
        if(err) throw err;
        else
        response.render('viewemps', {data: result ,user:request.session.user} );
    });
    }
    else
    response.render('index');
    
});


app.get('/createemp' , (request , response) => {
    response.render('newemp',{user:request.session.user}); 
});

app.get('/homeemp' , (request , response) => {
    response.render('home' ,{user:request.session.user}); 
});


app.get('/ShowEmp', (request, response)=>{
    var eid=request.query.empid;
    var sql="select * from employee where eid ="+eid;
    con.query(sql , (err,result)=>{
        if(err) throw err;
        else{
            response.render('showemp', {emp:result});
        }
    });
});


app.get('/logout',(request,response)=>{
    request.session.destroy();
    response.render('index');
    });


    

app.post('/loginCheck' , (request , response) =>{
    // response.end("<h1>Form Submitted By POST method</h1>");

    var uid = request.body.uid;
    var password = request.body.password;

    var sql = "select * from login where uid=? and password=?";
    var inputs = [uid , password];
    sql = mysql.format(sql , inputs);
    con.query(sql , (err,result)=>{
        if(err) throw err;
        else if(result.length > 0){
            request.session.user=uid;
            response.render('home' , {user:request.session.user});
        }
        else
            response.render('index' , {msg: 'Login Fail'});
    });
});


const upload = require('express-fileupload');
app.use(upload());

app.post('/EmpInsert' , (request, response) => {
    console.log(request.files);
    if(request.files)
    {
        var eid = request.body.eid;
        var ename = request.body.ename;
        var salary = request.body.salary;
        var address = request.body.address;
        var email = request.body.email;
        var password = Math.random().toString(36).slice(-8);

        var alldata = request.files.file;
        var filename = alldata.name;
        var altfname = password + filename;
        alldata.mv('./public/upload/'+ altfname , (err)=>{
            if(err) throw err;
            else
            {
                var sql = "insert into employee values(?,?,?,?,?,?,?)";
                var input=[eid , ename, salary, address, email, password, altfname];
                sql = mysql.format(sql, input);
                con.query(sql , (err) => {
                    if(err) throw err;
                    else{
                        response.render('newemp',{msg:'Data Inserted & File Uploaded'});
                    }
                });
            }
        });
    }
});


/*------------------------------------ Node Mailer ---------------------------------------*/

/*
app.post('/EmpInsert' , (request, response) => {
    var eid = request.body.eid;
    var ename = request.body.ename;
    var salary = request.body.salary;
    var address = request.body.address;
    var email = request.body.emailid;
    var password = Math.random().toString(36).slice(-8);

    var sql="insert into employee values(?,?,?,?,?,?)";
    var input=[eid , ename, salary, address, email, password];
    sql = mysql.format(sql, input);
    con.query(sql , (err) => {
        if(err) throw err;
        else
        {
            var mailoptions = {
                from: 'youremailid@gmail.com' ,
                to: email,
                subject: 'EMS Password',
                text: 'Hello '+ename+', Your EMPID = '+eid+' and Your password = '+password
            };

            transporter.sendMail(mailoptions, function(err , info){
                if(err) throw err;
                else{
                    console.log('Email sent : ' + info.response);
                }
            })

            response.render('newemp', {msg: 'Data Inserted and mail sended successfully.'});
        }
    });
});
*/
/*---------------------------------------------------------------------------------------------*/


app.post('/EmpUpdate' , (request, response) => {
    var eid = request.body.eid;
    var ename = request.body.ename;
    var salary = request.body.salary;
    var address = request.body.address;

    var sql="update employee set ename=? , salary=? , address=? where eid=?";
    var input=[ename, salary, address, eid];
    sql = mysql.format(sql, input);
    con.query(sql , (err) => {
        if(err) throw err;
        else
        {
            var sql= "select * from employee";
            con.query(sql , (err, result)=>{
                if(err) throw err;
                else
                response.render('viewemps',{data: result});
            });
        }
    });
});


app.use(function(request , response){
    response.status(404);
    response.render('404',{title : '404: Requested Page Not Found'});
});



