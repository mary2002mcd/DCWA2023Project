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

    // res.send(employees)
    res.render("addStore", { errors: undefined })//load the html page
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

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
    res.render("addStore",
    {errors:errors.errors})
    } else {
        mySQLDAO.addStore(req.body.sid, req.body.location, req.body.mgrid)
        .then((data) => {
            console.log(data)
            console.log("added")
            res.redirect('/stores')

        })
        .catch((error) => {
            console.log("y")
            // Handle error
            //if(error.code == )//look up error.code for specific error - other than that just print error
            res.render("errors", { "myerror": "cant add" })
        })
    }  
})

app.get('/stores/editStore/:sid', (req, res) => {

    // res.send(employees)
    res.render("editStore", { errors: undefined })//load the html page
})

app.post('/stores/editStore/:sid', [
    check("location").isLength({ min: 1 })
        .withMessage("Location must be at least 1 character"),
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
    {errors:errors.errors})
    } else {
        mySQLDAO.editStores(req.body.sid, req.body.location, req.body.mgrid)
        .then((data) => {
            console.log(data)
            console.log("updated")
            res.redirect('/stores')

        })
        .catch((error) => {
            console.log("y")
            // Handle error
            res.render("errors", { "myerror": "cant edit" })
        })
    }  
})

////////////Products Page///////////////////////////////
app.get('/products', (req, res) => {
    mySQLDAO.getProducts()
        .then((data) => {
            res.render("products", { "products": data })
        })
        .catch((error) => {
            res.send(error)
        })

})

app.get('/products/delete/:pid', (req, res) => {
    mySQLDAO.deleteProducts(req.params.pid)
        .then((data) => {console.log(data)
            console.log("deleted "+ req.params.pid)
            res.redirect('/products')
            
        })
        .catch((error) => {
            console.log("y")
            // Handle error
            //if(error.code == )//look up error.code for specific error - other than that just print error
            res.render("errors", {"myerror": req.params.pid + " is currently in stores and cannot be deleted"})
        })
 })

/////////////MONGODB MANAGER STUFF//////////////////////////

//get the data in the table
app.get('/managers', (req, res) => {
    mongoDAO.findAllManagers()
        .then((data) => {
            res.render("manager", { "managers": data })
        })
        .catch((error) => {

        })

})
//get the page to add a new manager
app.get('/addManager', (req, res) => {

    res.render("addManager", { errors: undefined })//load the html page
})

//post method - to add the manager to the database
app.post('/addManager', [
    //using validation from lab 7 - if the requirements are not met display error message
    check("id").isLength({ min: 4, max: 4 })
        .withMessage("ID has to be 4 characters long"),
    check("name").isLength({ min: 5 })
        .withMessage("Name must be > 5 characters long"),
    check("salary").isFloat({ min: 30000, max: 70000 })
        .withMessage("Salary must be between 30000 and 70000")
], (req, res) => {
    console.log(req.body.id)
    console.log(req.body.name)
    console.log(req.body.salary)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors)
    res.render("addManager",
    {errors:errors.errors})
    } else {
        
        mongoDAO.addManager({

            _id: req.body.id,
            name: req.body.name,
            salary: req.body.salary
        })
            .then((result) => {
                res.redirect('/managers')
            })
            .catch((error) => {
                console.log(error)
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