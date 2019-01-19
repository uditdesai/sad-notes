var express    = require("express"),
    app        = express(),
    firebase   = require("firebase");
    bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDsKphKfOm_Fv7inA5t1vcMJHo3bJlitBs",
  authDomain: "washroom-break.firebaseapp.com",
  databaseURL: "https://washroom-break.firebaseio.com",
  storageBucket: "<BUCKET>.appspot.com",
  messagingSenderId: "<SENDER_ID>",
};
firebase.initializeApp(config);
var database = firebase.database();
var provider = new firebase.auth.GoogleAuthProvider();

app.get("/", function(req, res){
	res.redirect("/posts")
});

app.get("/posts", function(req, res){
	var newPost = database.ref("messages").orderByChild("upvotes");
	newPost.once("value", function(data) {
		var posts = data.val();
		if(!(posts == null)){
			var postsList = [];
			var count = 0;
			var valuesList = Object.keys(posts).map(function(key){
							return posts[key];
						});
			var keysList = Object.keys(posts);
			valuesList.forEach(function(post){
				var singlePost = {};
				singlePost['key'] = keysList[count];
				singlePost['value'] = post;
				postsList.push(singlePost);
				count++;
			});
			postsList.sort(function(a,b){
				return a.value.upvotes - b.value.upvotes;
			});
			postsList.reverse();
		} else {
			var postsList = [{key: 0, value: {message: "noname", upvotes: 0}}];
		}
		console.log(postsList);
		res.render("home", {posts: postsList});
	});
});

app.post("/posts/new", function(req, res){
	database.ref("messages").push().set({
		message: req.body.message,
		upvotes: 0
	});
	res.redirect("/posts");
});



app.post("/posts/login", function(req, res){
	firebase.auth().signInWithPopup(provider).then(function(result) {
	  // This gives you a Google Access Token. You can use it to access the Google API.
	  var token = result.credential.accessToken;
	  // The signed-in user info.
	  var user = result.user;
	  // ...
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // The email of the user's account used.
	  var email = error.email;
	  // The firebase.auth.AuthCredential type that was used.
	  var credential = error.credential;
	  // ...
	});
	res.redirect("/posts");
});

app.post("/posts/:id", function(req, res){
	var post = database.ref("messages/" + req.params.id);
	post.once("value", function(data) {
		var posts = data.val();
		var upvoteCount = posts.upvotes + 1;
		database.ref("messages/" + req.params.id).update({
			upvotes: upvoteCount
		});
		res.redirect("/posts");
	});
});

app.listen(process.env.PORT || 3000, function(){
	console.log("Server started!");
});



