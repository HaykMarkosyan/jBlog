//jshint esversion:6
require('dotenv').config();
const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const LocalStrategy = require('passport-local').Strategy;


const app = express();

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))


// app.use(session({
//   secret: "My little secret.",
//   resave: false,
//   saveUninitialized: false
// }));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://admin-hayk:Test@cluster0.d8y9j.mongodb.net/jBlogDB", { useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String
});


userSchema.plugin(passportLocalMongoose)


const Users = mongoose.model("Users", userSchema);

passport.use(Users.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    Users.findById(id, function (err, user) {
        done(err, user);
    });
});

const postSchema = {
    title: String,
    content: String,
		username: String,
    color: String
}

const Posts = mongoose.model("Posts", postSchema)

let posts = [];
let logined = false;
let pusername = "";


// GET s


app.get("/in", function (req, res) {
    res.render("0")
})

app.get("/new", function (req, res) {
    res.render("0") //voch misht animaciai ej kam div piti sarqvi
})

app.get("/", function (req, res) {
    if (logined == true) {
			passport.authenticate("local-login")(req, res, function () {	
        Posts.find({}, function (err, foundItems) {
            if (!err) {
                res.render("home", { posts: foundItems })
            } else {
                console.log(err)
            }
        })
			});
    } else {
        res.render("0")
    }
})


app.get("/home", function (req, res) {
    if (logined == true) {
        Posts.find({}, function (err, foundItems) {
            if (!err) {
                res.render("home", { posts: foundItems })
            } else {
                console.log(err)
            }
        })
    } else {
        res.redirect("/login")
    }
})

app.get("/posts/:postId", function (req, res) {
    if (logined == true) {
        const requestedPostId = req.params.postId;

        Posts.findOne({ _id: requestedPostId }, function (err, post) {

            res.render("post", {
                title: post.title,
                content: post.content,
								username: post.username,
								color: post.color
            });

        })
    }
})

app.get("/about", function (req, res) {
    if (logined == true) {
        res.render("about")
    } else {
        res.redirect("/")
    }
})

app.get("/compose", function (req, res) {
    if (logined == true) {
        res.render("compose")
    } else {
        res.redirect("/")
    }
})


app.get("/register", function (req, res) {
    if (logined == true) {
        res.redirect("/")
    } else {
        res.render("register")
    }
})

app.get("/login", function (req, res, login) {
    if (logined == true) {
        res.redirect("/")
    } else {
        res.render("login")
    }
})


app.get("/logout", function (req, res, login) {
    req.logout();
    logined = false;
    res.redirect("/");
});


// POST s


app.post("/register", function (req, res) {

    Users.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/new");
            });
        }
    });

});

app.post("/login", function (req, res) {
    const user = new Users({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {

            passport.authenticate("local")(req, res, function () {
                logined = true;
								console.log(user.username)
								pusername = user.username;
                res.redirect("/");
            });
        }
    });
})

app.post("/compose", function (req, res) {
    const newpost = new Posts({
        title: req.body.postTitle,
        content: req.body.postBody,
				username: pusername,
        color: req.body.color
    })

    posts.push(newpost);

    Posts.insertMany(newpost, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log(newpost)
        }
    })
    res.redirect("/")
})


app.post("/posts", function(req, res) {
	if (logined == true) {

		// let searchresults = [];

			Posts.find({title: req.body.tsearch}, function (err, foundItems) {
					if (!err) {
						res.render("posts", { posts: foundItems })
					} else {
						console.log(err)
					}
			})



	} else {
 		res.redirect("/login")
 }
})



let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server has started successfully.");
});
