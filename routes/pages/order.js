const express = require('express')
const mysql = require('../../model/myDB')
const sha256 = require('sha256')
const log = require('loglevel')
const uuid = require('uuid/v4')
const co = require('co')
const Promise = require('bluebird')
const random = require('random')

const router = express.Router()
const pool = mysql.getPool()

log.setDefaultLevel('INFO')

router.get('/', function (req, res, next) {
    // res.send('respond with a resource');
    res.render('pages/order', {
        title: 'Order'
    })
});


router.post('/', function (req, res, next) {
    let json = {
        code: 2000,
        data: {},
        viddata: {},
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
            condition = ''
            log.info("get order")
            const GetOrder = 'SELECT * FROM orders '
            const GetVID = 'SELECT name FROM vendor '
            const GetPDATA = 'SELECT pName,pID FROM product'
            co(function* exec() {
                result = yield query(GetOrder, condition)
                //log.info(result)
                if (result) {
                    if (result.length == 0) {
                        json.msg = 'order is 0 row'
                    }
                    resultPDATA = yield query(GetPDATA, condition)
                    if (resultPDATA) {
                        resultVID = yield query(GetVID, condition)
                        if (resultVID) {

                            json.code = 2001
                            json.msg = 'get order success '
                            json.data = result
                            json.viddata = resultVID
                            json.pdata = resultPDATA
                            res.send(json)
                            connect.release()
                        } else {
                            log.info(err)
                            json.code = 6000
                            json.msg = 'get vid error '
                            res.send(json)
                            connect.release()
                        }
                    }
                    else {
                        log.info(err)
                        json.code = 6000
                        json.msg = 'get pname error '
                        res.send(json)
                        connect.release()
                    }
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'get order error '
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
            //log.info("create order")
            const num = 'SELECT count(*) from orders '
            condition = ''
            const insertOrder = 'INSERT INTO orders (oID,uName,pID,price,amount,discount,total,tradeYear,tradeMonth,tradeDay,createUser,updateUser) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) '
            co(function* exec() {
                result = yield query(num, condition)
                log.info(result)
                if (result) {
                    let a = JSON.stringify(result)
                    let num_g = a.match(/\d+/);
                    condition = ["o" + (parseInt(num_g[0]) + 1), req.body.uName, req.body.pID, req.body.price, req.body.amount, req.body.discount, req.body.total, req.body.tradeYear, req.body.tradeMonth, req.body.tradeDay, req.body.createUser, req.body.createUser]
                    result2 = yield query(insertOrder, condition)
                    if (result2) {
                        json.code = 2001
                        json.msg = 'create order success '
                        json.data = result2
                        res.send(json)
                        connect.release()
                    } else {
                        log.info(err)
                        json.code = 6000
                        json.msg = 'create order error '
                        res.send(json)
                        connect.release()
                    }
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'create order error '
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
            condition = req.body.oID
            log.info("delete order")
            const GetOrder = 'DELETE FROM orders WHERE oID = ? '
            co(function* exec() {
                result = yield query(GetOrder, condition)
                //log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'delete order success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'delete order error '
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
            log.info("Edit order")
            const GetOrder = 'Update orders set uName=?,pID=?,price=?,amount=?,discount=?,total=?,tradeYear=?,tradeMonth=?,tradeDay=?,updateUser=?  WHERE oID = ? '
            condition = [req.body.uName, req.body.pID, req.body.price, req.body.amount, req.body.discount, req.body.total, req.body.tradeYear, req.body.tradeMonth, req.body.tradeDay, req.body.updateUser, req.body.oID]
            co(function* exec() {
                result = yield query(GetOrder, condition)
                //log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'edit order success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'edit order error '
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