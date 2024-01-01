var express = require('express')
var mongoDAO = require('./mongoDAO')

var app = express()
let ejs = require('ejs');
app.set('view engine', 'ejs')
var mySQLDAO = require('./MYSQLDAO')
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
const { check, validationResult } = require('express-validator');

//load the home page with the links
app.get('/', function (req, res) {
    res.render("home")
})
//MYSQL load the store table with links to add and edit
app.get('/stores', (req, res) => {
    mySQLDAO.getStores()//get the data for the table
        .then((data) => {
            console.log(data)
            res.render("stores", { "stores": data })//load the page

        })
        .catch((error) => {
            // Handle error
            res.send(error)
        })
})
//route to add a new row in the table
app.get('/stores/addStore', (req, res) => {

    res.render("addStore", { errors: undefined })//load the ejs page
})
//validate new data and iff it is all ok, add to the table
app.post('/stores/addStore', [
    check("location").isLength({ min: 1 })
        .withMessage("Location must be at least 1 character"),
    check("mgrid").isLength({ min: 4, max:4 })
        .withMessage("Manager ID must be 4 chars long")
], (req, res) => {
    console.log(req.body.sid)
    console.log(req.body.location)
    console.log(req.body.mgrid)
    //if there is errors display what error to the top of the addStore page in a list
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
    res.render("addStore",
    {errors:errors.errors})
    } 
    //if there is not errors add the store to the table
    else {
        mySQLDAO.addStore(req.body.sid, req.body.location, req.body.mgrid)
        .then((data) => {
            console.log(data)
            console.log("added")
            res.redirect('/stores')//send back to the store page

        })
        //catch the error that you cant have 2 managers managing the same store
        .catch((error) => {
            // Handle error
            //res.render("errors", { "myerror": "cant add - Manager is already used" })
            //display it at the top of the page instead of a seperate error page
            res.render("addStore", { errors: [{ msg: "Error: Manager ID " + req.body.mgrid + " already exists"}] })
        })
    }  
})
//edit the store with that specific sid
app.get('/stores/editStore/:sid', (req, res) => {

    res.render("editStore", { errors: undefined })//load the html page
})

//to edit a store - must meet requirements such not being able to edit sid
//i didnt put validation for updating the sid because it wont let me update the sid anyway because i passed it into the route
app.post('/stores/editStore/:sid', [
    //location must be 1 char in length at least
    check("location").isLength({ min: 1 })
        .withMessage("Location must be at least 1 character"),
    //manager id must be 4 chars
    check("mgrid").isLength({ min: 4, max:4 })
        .withMessage("Manager ID must be 4 chars long")
], (req, res) => {
    console.log(req.body.sid)
    console.log(req.body.location)
    console.log(req.body.mgrid)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
    res.render("editStore",
    {errors:errors.errors})//load errors to top of page
    } 
    //if there is not errors update the store
    else {
        mySQLDAO.editStores(req.body.sid, req.body.location, req.body.mgrid)
        .then((data) => {
            console.log(data)
            console.log("updated")
            res.redirect('/stores')

        })
        .catch((error) => {
            // Handle error
            res.render("errors", { "myerror": "cant edit" })
        })
    }  
})

////////////Products Page///////////////////////////////
//display the products page using a left join
app.get('/products', (req, res) => {
    mySQLDAO.getProducts()
        .then((data) => {
            res.render("products", { "products": data })//load the table
        })
        .catch((error) => {
            res.send(error)
        })

})

//delete a product if not sold in a store
app.get('/products/delete/:pid', (req, res) => {
    //call the delete functon
    mySQLDAO.deleteProducts(req.params.pid)
        .then((data) => {console.log(data)
            //It wouldnt delete if its not supposed to but
            //I couldnt get the error message to display so I googled how to show it
            //https://www.w3schools.com/nodejs/nodejs_mysql_delete.asp
            //found out affectedRows being zero means nothing was changed so to show the message if it doesnt delete
            if(data.affectedRows == 0){
                //display error message on seperate page
                res.render("errors", {"myerror": req.params.pid + " is currently in stores and cannot be deleted"})
            }
            else{
                console.log("deleted "+ req.params.pid)
                 res.redirect('/products')
            
            }
            
        })
        .catch((error) => {
            console.log("y")
            // Handle error
            res.render("errors", {"myerror": req.params.pid + " is currently in stores and cannot be deleted"})
        })
 })

/////////////MONGODB MANAGER STUFF//////////////////////////

//get the data in the table
app.get('/managers', (req, res) => {
    mongoDAO.findAllManagers()
        .then((data) => {
            res.render("manager", { "managers": data })//load table in ejs page
        })
        .catch((error) => {

        })

})
//get the page to add a new manager
app.get('/managers/addManager', (req, res) => {

    res.render("addManager", { errors: undefined })//load the html page
})

//post method - to add the manager to the database
app.post('/managers/addManager', [
    //using validation from lab 7 - if the requirements are not met display error message
    //make id be 4 chars in length
    check("id").isLength({ min: 4, max: 4 })
        .withMessage("ID has to be 4 characters long"),
    //make name be at least 5 chars
    check("name").isLength({ min: 5 })
        .withMessage("Name must be > 5 characters long"),
    //make the salary be between 30000 - 70000
    check("salary").isFloat({ min: 30000, max: 70000 })
        .withMessage("Salary must be between 30000 and 70000")
], (req, res) => {
    //send to console for testing
    console.log(req.body.id)
    console.log(req.body.name)
    console.log(req.body.salary)

    //if there is errors reload the html and display the error messages in bullet points at the top of the screen
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
    res.render("addManager",
    {errors:errors.errors})
    } 
    //else if there is no errors add the new manger to the db
    else {
        //call method
        mongoDAO.addManager({
            //get the attributes from the input
            _id: req.body.id,
            name: req.body.name,
            salary: req.body.salary
        })
            .then((result) => {
                //reload the managers page with the update
                res.redirect('/managers')
            })
            .catch((error) => {
                console.log(error)
                //using the specific error code for a not unique id - print out the message at the top of the screen
                if (error.code == 11000) {
                    res.render("addManager", { errors: [{ msg: "Error: Manager ID " + req.body.id + " already exists"}] })
                }
    
            })
    }

})


//callback function
app.listen(3000, () => {
    console.log("Listening on port 3000")
})