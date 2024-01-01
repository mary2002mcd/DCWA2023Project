var pmysql = require('promise-mysql')

var pool;

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

var getProducts = function () {
    return new Promise((resolve, reject) => {
        pool.query('SELECT p.pid, p.productdesc, ps.sid, s.location, ps.price FROM product p LEFT JOIN product_store ps ON p.pid = ps.pid LEFT JOIN store s ON ps.sid = s.sid')
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

var deleteProducts = function (pid) {
    
    return new Promise((resolve, reject) => {
    var myQuery = {
        //https://www.w3schools.com/mysql/mysql_exists.asp
        sql: 'DELETE FROM product WHERE pid=? AND NOT EXISTS (SELECT 1 FROM product_store WHERE pid = ?)',
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


//https://www.w3schools.com/mysql/mysql_update.asp
var editStores = function (sid, location, mgrid) {
    
    return new Promise((resolve, reject) => {
    var myQuery = {
        sql: 'UPDATE store SET location= ?, mgrid = ? WHERE sid = ?',
        values: [location, mgrid, sid]
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

var addStore = function (sid, location, mgrid) {
    console.log(sid)
    return new Promise((resolve, reject) => {
    var myQuery = {
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
    

 module.exports = { getStores, addStore, editStores, getProducts, deleteProducts}
