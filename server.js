var express              = require('express')
var app                  = express()
var https                = require('https')
const ejs                = require('ejs')
var bodyParser           = require('body-parser')
const mongoose           = require('mongoose')
const Question           = require('./models/question')
const User               = require('./models/user')
const session            = require('express-session')
//const flash              = require('express-flash')
const MongoDbStore       = require('connect-mongo')(session)
const bcrypt             = require('bcrypt')
const passport           = require('passport')
const LocalStrategy      = require('passport-local').Strategy


//Database connection
const url = 'mongodb://localhost/forms';
mongoose.connect(url, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connection Failed');
});


//Session Store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})

//Session configuration
app.use(session({
    secret: 'abcdef',
    resave: false,
            saveUninitialized: false,
            store: mongoStore,
            cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

//passport configuration
const passportInit = function(){
    passport.use(new LocalStrategy({ usernameField: 'email'}, async (email, password, done) => {
        //login logic
        //check if email exists
        const user = await User.findOne({ email: email})
        if(!user){
            return done(null, false, {message: 'No user with this email'})
        }

        //if user exists with the given email check if password matches
        bcrypt.compare(password, user.password).then(match => {
            if(match){
                return done(null, user, {message: 'Logged in successfully'})
            }

            return done(null, false, {mesaage: 'wrong password'})
        }).catch(err => {
            return done(null, false, {message: 'Something went wrong'})
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })

}
passportInit()
app.use(passport.initialize())
app.use(passport.session())

//app.use(flash)
app.use(bodyParser.urlencoded({extended:true})) 
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

//global middlewares to make session and user globally available
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

let ques=1                              //Store the No. of question
let opt=[1]                             //Store the count of option for each question   
let question_text=['']                  //Store the text of each Question 
let option_text=[['']]                  //Store the array of options for each question 
let option_type=['']                    //Store the Option Type for each question

//Register and login 
app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res)=>{
    res.render('login')
})

app.post('/register', async (req, res) => {
    //validate request
    const {name, email, password} = req.body
    if(!name || !email || !password){
        console.log(err);
        return res.redirect('/register')
    }

    //Check if email exists
    User.exists({ email: email }, (err, result) => {
        if(result) {
            console.log('user already exists')
            return res.redirect('/register')
        }
    })

    //Hashedpassword
    const hashedPassword = await bcrypt.hash(password, 10)

    //Otherwise create a user in the database
    const user = new User({
        name: name,
        email: email,
        password: hashedPassword 
    })

    //save the user registration data
    user.save().then((user) => {
        return res.redirect('/');
    }).catch(err => {
        console.log('Something went wrong while registering');
        return res.redirect('/register');
    })
})

app.post('/login', (req, res, next) => {
    const { email, password } = req.body
    //validate request
    if(!email || !password){
        console.log('All fields are required')
        return res.redirect('/login')
    }
    passport.authenticate('local', (err, user, info) => {
        if(err){
            console.log(err)
            return next(err)
        }

        if(!user){
            console.log(err)
            return res.redirect('/login')
        }

        req.logIn(user, (err) => {
            if(err){
                console.log(err)
                return next(err)
            }

            return res.redirect('/')
        })
    })(req, res, next)
})
// Main page
app.get('/',(req,res)=>                         
{
    //console.log(opt,ques)
    console.log(option_text)
    res.render('create_form',{question:ques,option:opt,question_text:question_text,option_text:option_text,option_type:option_type});
})

//Add Question
app.get('/AddQuestion',(req,res)=>{
    ques++;
    opt.push(1);
    question_text.push('')
    option_type.push('')
    option_text.push([''])

    console.log("add question",opt)
    res.redirect("/")
})

//Add Option
app.get('/addOption',(req,res)=>
{
        let temp=req.query.QuestionNumber
        opt[temp]++;
        console.log(temp,opt)
       // console.log(opt)
        res.redirect("/")
})

//Remove Question
app.get('/RemoveQuestion',(req,res)=>
{
       //console.log(req.body,parseInt(req.body.AddForQuestion))
       let temp=req.query.QuestionNumber
        ques--;
        console.log("Splice",temp,opt)
        opt.splice(temp,1)
        console.log("after Splice",opt)
        res.redirect("/")
})


//Remove Option
app.get('/RemoveOption',(req,res)=>
{

    let temp=req.query.QuestionNumber
    console.log(temp,opt)
    if (opt[temp]!=1)
    {
        opt[temp]--;
    
    }
    console.log(opt)
    res.redirect("/")
})



//Submit form
app.post("/StoreQuestion",(req,res)=>
{
    console.log(req.body)
    for (let i=0;i<ques;i++)
    {
        if (i==0)
        {
            question_text=[]
            option_text=[]
            option_type=[]
        }
        eval('question_text.push(req.body.ques'+i+')')
        eval('option_type.push(req.body.type'+i+')')
        let arr=[]
        
        for(let j=0;j<opt[i];j++)
        {
            eval('arr.push(req.body.ques'+i+'opt'+j+')')
            console.log('arr.push(req.body.ques'+i+'opt'+j+')')
        }
        option_text.push(arr)  
    }
    console.log(question_text,option_text,option_type)
    const question = new Question({
        adminID: req.user._id,
        question: question_text,
        option: option_text,
        type: option_type
    })

    question.save().then(result => {
        console.log('successful')
        res.redirect('/register')
    }).catch(err => {
        console.log('error occurred while storing in db')
        return res.redirect('/')
    })
})



app.listen('3003', function(){
        console.log("Server Started")
})