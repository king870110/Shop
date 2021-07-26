const express = require('express')
const mysql = require('../../model/myDB')
const sha256 = require('sha256')
const log = require('loglevel')
const uuid = require('uuid/v4')
const co = require('co')
const Promise = require('bluebird');

const router = express.Router()
const pool = mysql.getPool()

log.setDefaultLevel('INFO')

router.get('/', function (req, res, next) {
    // res.send('respond with a resource');
    res.render('pages/product', {
        title: 'Product'
      })
});


router.post('/', function (req, res, next) {
    let json = {
        code: 2000,
        data: {},
        msg: ''
    }
    pool.getConnection((err, connect) => {
        if (err) {
            log.error(err)
            json.code = 6000
            json.msg = 'connect error'
            res.send(json)
            connect.release()
        } else {
            let condition, result
            const query = Promise.promisify(connect.query, {
                context: connect
            })
            condition=''
            log.info("get product")
            const GetProduct = 'SELECT * FROM product '
            co(function* exec() {
                result = yield query(GetProduct,condition)
                log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'get product success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'get product error '
                    res.send(json)
                    connect.release()
                }
            }).catch(err => {
                log.info(err)
                json.code = 6000
                json.msg = 'database is having a problem '
                res.send(json)
                connect.release()
            })
        }
    })
})

router.post('/create', function (req, res, next) {
    log.info(req.body)
    log.info("---------------------")
    let json = {
        code: 2000,
        data: {},
        msg: ''
    }
    pool.getConnection((err, connect) => {
        if (err) {
            log.error(err)
            json.code = 6000
            json.msg = 'connect error'
            res.send(json)
            connect.release()
        } else {
            let condition, result
            const query = Promise.promisify(connect.query, {
                context: connect
            })
            //log.info("create product")
            const num = 'SELECT count(*) from product '
            condition = ''
            const insertProduct = 'INSERT INTO product (pID,pName,avePrice,store,safeStore,updateUser) VALUES (?,?,?,?,?,?) '
            condition=["p"+req.body.pID,req.body.pName,req.body.avePrice,req.body.store,req.body.safeStore,req.cookies.uID]
            co(function* exec() {
                result = yield query(num, condition)
                log.info(result)
                if (result) {
                    let a = JSON.stringify(result)
                    let num_g = a.match(/\d+/);
                    condition=["p" + (parseInt(num_g[0]) + 1),req.body.pName,req.body.avePrice,req.body.store,req.body.safeStore,req.cookies.uID]
            
                    result2 = yield query(insertProduct, condition)
                    if (result2) {
                        json.code = 2001
                        json.msg = 'create product success '
                        json.data = result2
                        res.send(json)
                        connect.release()
                    } else {
                        log.info(err)
                        json.code = 6000
                        json.msg = 'create product error '
                        res.send(json)
                        connect.release()
                    }
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'create product error '
                    res.send(json)
                    connect.release()
                }
            }).catch(err => {
                log.info(err)
                json.code = 6000
                json.msg = 'database is having a problem '
                res.send(json)
                connect.release()
            })
        }
    })
})

router.post('/del', function (req, res, next) {
    log.info(req.body)
    log.info("---------------------")
    let json = {
        code: 2000,
        data: {},
        msg: ''
    }
    pool.getConnection((err, connect) => {
        if (err) {
            log.error(err)
            json.code = 6000
            json.msg = 'connect error'
            res.send(json)
            connect.release()
        } else {
            let condition, result
            const query = Promise.promisify(connect.query, {
                context: connect
            })
            condition=req.body.pID
            log.info("delete product")
            const GetProduct = 'DELETE FROM product WHERE pID = ? '
            co(function* exec() {
                result = yield query(GetProduct,condition)
                //log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'delete product success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'delete product error '
                    res.send(json)
                    connect.release()
                }
            }).catch(err => {
                log.info(err)
                json.code = 6000
                json.msg = 'database is having a problem '
                res.send(json)
                connect.release()
            })
        }
    })
})

router.post('/edit', function (req, res, next) {
    log.info(req.body)
    log.info("---------------------")
    let json = {
        code: 2000,
        data: {},
        msg: ''
    }
    pool.getConnection((err, connect) => {
        if (err) {
            log.error(err)
            json.code = 6000
            json.msg = 'connect error'
            res.send(json)
            connect.release()
        } else {
            let condition, result
            const query = Promise.promisify(connect.query, {
                context: connect
            })
            log.info("Update product")
            const GetProduct = 'Update product set pName=?,avePrice=?,store=?,safeStore=?,updateUser=? WHERE pID = ? '
            condition=[req.body.pName,req.body.avePrice,req.body.store,req.body.safeStore,req.cookies.uID,req.body.pID]
            co(function* exec() {
                result = yield query(GetProduct,condition)
                //log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'edit product success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'edit product error '
                    res.send(json)
                    connect.release()
                }
            }).catch(err => {
                log.info(err)
                json.code = 6000
                json.msg = 'database is having a problem '
                res.send(json)
                connect.release()
            })
        }
    })
})

module.exports = router;