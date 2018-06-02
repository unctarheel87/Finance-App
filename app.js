var express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    methodOverride        = require("method-override"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Budget                = require("./models/budget"),
    User                  = require("./models/user"),
    request               = require("request")
    
    
mongoose.connect("mongodb://localhost/retire_app");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

// ----- PASSPORT & LOCAL MONGOOSE STRATEGY CONFIG -----

//Create Session
app.use(require("express-session")({
    secret:"John is a master guitarist",
    resave: false,
    saveUninitialized: false
}));

//ask Express to use passport
app.use(passport.initialize());
//ask Express to use session created above
app.use(passport.session());

//tell passport to use a Local Strategy
//assign User.authenticate from passportLocalMongoose to LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
//encoding / unencoding methods!
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set currentUser for all templates and pass to next middleware
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});


// ==============
//    ROUTES
// ==============

app.get('/stocks', function(req, res) {
    var query = req.query.search;
    var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=INX&apikey=NSUNV8LPVSSN0247"
    request(url, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            res.render('stocks', {data: data, stockName: query});
        }
    })
    
})

app.get('/', function(req, res) {
    var age = Number(req.query.age);
    var salary = Number(req.query.salary);
    var amount = Number(req.query.amount);
    var query = req.query
    res.render('index', {age: age, salary: salary, amount: amount, query: query});
});


app.get('/users/:id/', isLoggedIn, function(req, res) {
    User.findOne({username: req.params.id}, function(err, foundUser) {
        if(err) {
            res.redirect('/');
        } else {
            res.render('profile', {user: foundUser})
        }
    });
});

app.get('/users/:id/budget/new', function(req, res) {
   res.render('new')
});

app.get('/users/:id/budget/:budget/edit', function(req, res) {
    Budget.findOne({'user.username': req.user.username}, function(err, foundBudget) {
        if(err) {
            console.log(err);
        } else {
           res.render('edit', {budget: foundBudget});
        }
    });
});   
    

app.get('/users/:id/budget', function(req, res) {
    Budget.findOne({'user.username': req.user.username}, function(err, foundBudget) {
        if(err) {
            console.log(err);
        } else {
           res.render('budget', {budgets: foundBudget});
        }
    });
});    

app.get('/users/:id/budget/:budget', function(req, res) {
    Budget.findById(req.params.budget, function(err, foundBudget) {
        if(err) {
            console.log(err);
        } else {
           res.render('userBudget', {budget: foundBudget});
        }
    });
});


app.post('/users/:id/budget', function(req, res) {
    var newBudget = req.body.budget;
    Budget.create(newBudget, function(err, newlyCreated) {
        if(err) {
            console.log(err)
        } else {
            newlyCreated.user.id = req.user._id;
            newlyCreated.user.username = req.user.username;
            newlyCreated.save();
            console.log(newlyCreated);
            res.redirect("/users/" + req.user.username + "/budget" + newlyCreated._id);
        }
    });
});

app.put('/users/:id/budget/:budget', function(req, res) {
    var newBudget = req.body.budget;
    Budget.findByIdAndUpdate(req.params.budget, newBudget, function(err, updatedBudget) {
        if(err) {
            console.log(err)
        } else {
            console.log(updatedBudget);
            res.redirect("/users/" + req.user.username + "/budget");
        }
    });
});


// ==========================================
//  Registration/Login/Logout Routes & Logic
// ==========================================

app.get('/register', function(req, res) {
    res.render("register");
});

app.post('/register', function(req, res) {
    // grab info from form and use included register method
    User.register(new User({username: req.body.username, name: req.body.name, email: req.body.email}), req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            return res.render('register')
        } else {
        passport.authenticate('local')(req, res, function(){
            res.redirect('/users/' + req.user.username)
        });
        }
    });
});

//Render Login 
app.get('/login', function(req, res) {
    res.render("login");
});

//login logic
//middleware (between route and function(req,res)
app.post('/login', 
    passport.authenticate("local"), 
    function(req, res) {
    res.redirect("/users/" + req.user.username);
});

//Logout
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

//middleware for checking if user is logged in
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
};

// Start Server!
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started!");
});