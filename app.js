var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport    = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user.js");
var Habit = require("./models/habit.js");
var Log = require("./models/log.js");
var moment = require("moment");


mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/todayApp", { useNewUrlParser: true });

app.use(bodyParser.urlencoded ({extended: true}));
app.use(express.static(__dirname + "/public"));

var quotes = ["With the new day comes new strength and new thoughts",
			 "Don't count the days, make the days count",
			 "Its not about perfect, it's about effort",
			 "Your allowed to be tired, but don't give up",
			 "It may be hard, but that doesn't mean impossible"];
 

// PASSPORT CONFIGURATIONs
app.use(require("express-session")({
    secret: "Sasuke is the best",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
	//res.locals.error = req.flash("error");
	//res.locals.success = req.flash("success");
   next();
});

app.get("/", function(req, res){
	if (req.user) {
		res.redirect("/"+req.user._id + "/habits");
	} else {
	res.render("landing.ejs");
	}
}); 

app.get("/register", function(req, res){
	res.render("register.ejs");
});

app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
			//req.flash("error", err.message);
			return res.render("register.ejs");
        }
        passport.authenticate("local")(req, res, function(){
			//req.flash("success", "Welcome to Momentum " + user.username);
           res.redirect("/" +newUser._id + "/habits"); 
        });
    });
});
 
app.get("/login", function(req, res){
	res.render("login.ejs");
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login' }));


app.get("/more", function(req, res){
	res.render("more.ejs");
});

app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/");
});

app.get("/:id/habits", function(req, res){
	var num = Math.floor(Math.random() * 5) + 1;
	
	var quote = quotes[num-1];
	
	//find the habits with provided ID
    User.findById(req.params.id).populate("habits").exec(function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            console.log(foundUser);
            //render habits template with the array of habit docs
            res.render("habits.ejs", {quote: quote, habits: foundUser.habits});
        }
    });
});

app.get("/:id/new", function(req, res){
	res.render("new_habit.ejs");
}); 

app.get("/:id/:habit_id",function(req, res){
	Habit.findById(req.params.habit_id).populate("logs").exec(function(err, foundHabit){
        if(err){
            console.log(err);
        } else {
            res.render("show.ejs", {habit: foundHabit});
        }
    });
});

app.get("/:id/:habit_id/new", function(req, res){
	Habit.findById(req.params.habit_id).populate("logs").exec(function(err, foundHabit){
        if(err){
            console.log(err);
        } else {
            res.render("new_log.ejs", {habit: foundHabit});
        }
    });
	
});


//complete route
app.get("/:id/:habit_id/complete", function(req, res){
	var isCompleted = "Yes";
	var note = "N/A";
	var date = moment().format("MMMM Do YYYY");
	
	var newLog = {completed: isCompleted, note: note, date: date};

	
	//lookup habit using ID
   Habit.findById(req.params.habit_id, function(err, habit){
       if(err){
           console.log(err);
           res.redirect("/"+req.params.id + "/" + req.params.habit_id);
       } else {
        Log.create(newLog, function(err, log){
           if(err){
               console.log(err);
           } else {
			   
               habit.logs.push(log);
               habit.save();
               //redirect back to habit show page
            res.redirect("/"+ req.params.id + "/" + req.params.habit_id);
           }
        });
       }
   });
});

app.post("/:id/habits", function (req, res) {
	var title = req.body.name;
	var img = req.body.image;
	var motiv = req.body.des;
	
	var newHabit = {title: title, image: img, motivation: motiv};
	
	//lookup campground using ID
   User.findById(req.params.id, function(err, user){
       if(err){
           console.log(err);
           res.redirect("/"+req.params.id + "/habits");
       } else {
        Habit.create(newHabit, function(err, habit){
           if(err){
               console.log(err);
           } else {
			   
               user.habits.push(habit);
               user.save();
               //redirect back to habits page
            res.redirect("/"+ req.params.id + "/habits");
           }
        });
       }
   });
	
});

app.post("/:id/:habit_id", function(req, res){
	var isCompleted = req.body.complete;
	var note = req.body.note;
	if (note.trim().length == 0){
		note = "N/A";
	}
	var date = moment().format("MMMM Do YYYY");
	
	var newLog = {completed: isCompleted, note: note, date: date};
	
	//lookup habit using ID
   Habit.findById(req.params.habit_id, function(err, habit){
       if(err){
           console.log(err);
           res.redirect("/"+req.params.id + "/" + req.params.habit_id);
       } else {
        Log.create(newLog, function(err, log){
           if(err){
               console.log(err);
           } else {
			   
               habit.logs.push(log);
               habit.save();
               //redirect back to habit show page
            res.redirect("/"+ req.params.id + "/" + req.params.habit_id);
           }
        });
       }
   });
	
	
});



app.listen(3000, function() { 
  console.log('Server listening on port 3000'); 
}); 