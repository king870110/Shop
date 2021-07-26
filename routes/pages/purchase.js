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
    res.render('pages/purchase', {
        title: 'Purchase'
    })
});


router.post('/', function (req, res, next) {
    let json = {
        code: 2000,
        data: {},
        nodata: {},
        viddata: {},
        piddata: {},
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
            log.info("get purchase")
            const GetPurchase = 'SELECT * FROM purchases '
            const GetNOID = 'SELECT * FROM purchaseno '
            const GetVID = 'SELECT name FROM vendor '
            const GetPID = 'SELECT pName FROM product'
            const GetTotalCal = 'SELECT purchaseno.noID, SUM(purchases.total) as t FROM purchaseno LEFT JOIN purchases ON purchaseno.noID = purchases.noID GROUP BY purchaseno.noID'
            co(function* exec() {
                result = yield query(GetPurchase, condition)
                //log.info(result)
                if (result) {
                    if (result.length == 0) {
                        json.msg = 'purchase is 0 row'
                    }
                    resultVID = yield query(GetVID, condition)
                    if (resultVID) {
                        resultPID = yield query(GetPID, condition)
                        if (resultPID) {
                            resultNOID = yield query(GetNOID, condition)
                            if (resultNOID) {
                                log.info(resultNOID)
                                //log.info(resultNOID[0].noID)
                                resultTotalCal = yield query(GetTotalCal)
                                log.info('-------------')
                                log.info(resultTotalCal)
                                if (resultTotalCal) {
                                    json.code = 2001
                                    json.msg = 'get purchase success '
                                    json.data = result
                                    json.nodata = resultNOID
                                    json.viddata = resultVID
                                    json.piddata = resultPID
                                    json.totaldata = resultTotalCal
                                    res.send(json)
                                    connect.release()
                                } else {
                                    log.info(err)
                                    json.code = 6000
                                    json.msg = 'get total error '
                                    res.send(json)
                                    connect.release()
                                }
                            } else {
                                log.info(err)
                                json.code = 6000
                                json.msg = 'get noid error '
                                res.send(json)
                                connect.release()
                            }
                        } else {
                            log.info(err)
                            json.code = 6000
                            json.msg = 'get pid error '
                            res.send(json)
                            connect.release()
                        }
                    } else {
                        log.info(err)
                        json.code = 6000
                        json.msg = 'get vid error '
                        res.send(json)
                        connect.release()
                    }
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'get purchase error '
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

router.post('/createNO', function (req, res, next) {
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
            log.info(req.body)
            if (!req.body.stop4) {
                req.body.stop4 = "1111-11-11"
            }
            if (!req.body.stop5) {
                req.body.stop5 = "1111-11-11"
            }
            if (!req.body.stop6) {
                req.body.stop6 = "1111-11-11"
            }
            const num = 'SELECT count(*) from purchaseno'
            condition = ''
            const insertPurchase = 'INSERT INTO purchaseno (noID,stop4,stop5,stop6,deliveryCost,totalCost,actCost) VALUES (?,?,?,?,?,?,?) '
            co(function* exec() {
                result = yield query(num, condition)
                if (result) {
                    let a = JSON.stringify(result)
                    let num_g = a.match(/\d+/);
                    log.info("取出的數字為:" + num_g[0]);
                    condition = ['no' + (parseInt(num_g[0]) + 1), req.body.stop4, req.body.stop5, req.body.stop6, req.body.deliveryCost, req.body.totalCost, req.body.actCost]
                    resultNO = yield query(insertPurchase, condition)
                    if (resultNO) {
                        json.code = 2001
                        json.msg = 'create purchaseno success '
                        json.data = result
                        res.send(json)
                        connect.release()
                    } else {
                        log.info(err)
                        json.code = 6000
                        json.msg = 'create purchaseno error '
                        res.send(json)
                        connect.release()
                    }
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'get purchaseno error '
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
            log.info(req.body)
            let pcid = req.body.stop1 + random.int(min = 0, max = 999)
            if (!req.body.stop1) {
                req.body.stop1 = "1111-11-11"
            }
            if (!req.body.stop2) {
                req.body.stop2 = "1111-11-11"
            }
            if (!req.body.stop3) {
                req.body.stop3 = "1111-11-11"
            }
            const num = 'SELECT count(*) from purchases '
            condition = ''
            const insertPurchase = 'INSERT INTO purchases (pcID,noID,pID,vID,stop1,stop2,stop3,price,amount,total) VALUES (?,?,?,?,?,?,?,?,?,?) '
            co(function* exec() {
                result = yield query(num, condition)
                log.info(result)
                if (result) {
                    let a = JSON.stringify(result)
                    let num_g = a.match(/\d+/);
                    condition = ["pc" + (parseInt(num_g[0]) + 1), req.body.noID, req.body.pID, req.body.vID, req.body.stop1, req.body.stop2, req.body.stop3, req.body.price, req.body.amount, req.body.total]
                    resultPC = yield query(insertPurchase, condition)
                    if (resultPC) {
                        json.code = 2001
                        json.msg = 'create purchase success '
                        json.data = resultPC
                        res.send(json)
                        connect.release()
                    } else {
                        log.info(err)
                        json.code = 6000
                        json.msg = 'create purchase error '
                        res.send(json)
                        connect.release()
                    }
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'get purchase error '
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

router.post('/del2', function (req, res, next) {
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
            condition = req.body.noID
            log.info("delete purchase")
            const GetPurchase = 'DELETE FROM purchaseno WHERE noID = ? '
            co(function* exec() {
                result = yield query(GetPurchase, condition)
                //log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'delete purchaseno success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'delete purchaseno error '
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
            condition = req.body.pcID
            log.info("delete purchase")
            const GetPurchase = 'DELETE FROM purchases WHERE pcID = ? '
            co(function* exec() {
                result = yield query(GetPurchase, condition)
                //log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'delete purchase success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'delete purchase error '
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

router.post('/edit2', function (req, res, next) {
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
            log.info("Edit purchaseno")
            if (!req.body.stop4) {
                req.body.stop4 = '1111-11-11'
            }
            if (!req.body.stop5) {
                req.body.stop5 = '1111-11-11'
            }
            if (!req.body.stop6) {
                req.body.stop6 = '1111-11-11'
            }
            const GetPurchase = 'Update purchaseno set deliveryCost=?,stop4=?,stop5=?,stop6=?,totalCost=?,actCost=? WHERE noID = ? '
            condition = [req.body.dCost, req.body.stop4, req.body.stop5, req.body.stop6, req.body.totalCost, req.body.actCost, req.body.noID]
            co(function* exec() {
                result = yield query(GetPurchase, condition)
                log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'edit purchase success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'edit purchase error '
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
            log.info("Edit purchase")
            if (!req.body.stop1) {
                req.body.stop1 = '1111-11-11'
            }
            if (!req.body.stop2) {
                req.body.stop2 = '1111-11-11'
            }
            if (!req.body.stop3) {
                req.body.stop3 = '1111-11-11'
            }
            const GetPurchase = 'Update purchases set noID=?,vID=?,pID=? ,price=?,amount=?,total=?,stop1=?,stop2=?,stop3=? WHERE pcID = ? '
            condition = [req.body.noID, req.body.vID, req.body.pID, req.body.price, req.body.amount, req.body.total, req.body.stop1, req.body.stop2, req.body.stop3, req.body.pcID]
            co(function* exec() {
                result = yield query(GetPurchase, condition)
                log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'edit purchase success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'edit purchase error '
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