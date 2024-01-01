var pmysql = require('promise-mysql')

var pool;
//connect to the mysql database
pmysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023'
})
    .then(p => {
        pool = p//pool should be equal to the connection to my database
    })
    .catch(e => {
        console.log("pool error:" + e)
    })

//using a promise get all the data from the store table using a sql query from the labs
var getStores = function () {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store')
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}
//make the products table by using a left join (from class) to make it look like the picture in the spec
//the table should display all the nessasary details even if the product is not sold in a store
var getProducts = function () {
    return new Promise((resolve, reject) => {
        //mysql query to create the joined table
        pool.query('SELECT p.pid, p.productdesc, pst.sid, s.location, pst.price FROM product p LEFT JOIN product_store pst ON p.pid = pst.pid LEFT JOIN store s ON pst.sid = s.sid')
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}
//
var deleteProducts = function (pid) {
    
    return new Promise((resolve, reject) => {
    var myQuery = {
        //https://www.w3schools.com/mysql/mysql_exists.asp
        sql: 'DELETE FROM product WHERE pid=? AND NOT EXISTS (SELECT 1 FROM product_store WHERE pid =?)',
        values: [pid, pid]
    }
    pool.query(myQuery)
        .then((data) => {
            resolve(data)
        })
        .catch(error => {
            reject(error)
        })
    })
}


//function to update the table with new information but not the sid
var editStores = function (sid, location, mgrid) {
    
    return new Promise((resolve, reject) => {
    var myQuery = {
        //https://www.w3schools.com/mysql/mysql_update.asp
        //dont change sid
        sql: 'UPDATE store SET location= ?, mgrid = ? WHERE sid = ?',
        values: [location, mgrid, sid]//in order used
    }
    pool.query(myQuery)
        .then((data) => {
            resolve(data)
        })
        .catch(error => {
            reject(error)
        })
    })
}
//function to add the store into the table - manager should nt be used twice in this either
//INSERT INTO store (sid, location, mgrid) VALUES (?, ?, ?) WHERE NOT EXISTS (SELECT 1 FROM store WHERE mgrid = ?) tried doing this but stopped the program
var addStore = function (sid, location, mgrid) {
    console.log(sid)
    return new Promise((resolve, reject) => {
    var myQuery = {
        //https://www.w3schools.com/mysql/mysql_insert.asp
        sql: 'INSERT INTO store (sid, location, mgrid) VALUES (?, ?, ?)',
        values: [sid, location, mgrid]
    }
    pool.query(myQuery)
        .then((data) => {
            resolve(data)
        })
        .catch(error => {
            reject(error)
        })
    })
}
    
//export to index.js to be used
 module.exports = { getStores, addStore, editStores, getProducts, deleteProducts}
