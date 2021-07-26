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
    res.render('pages/vendor', {
        title: 'Vendor'
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
            log.info("get vendor")
            const GetVendor = 'SELECT * FROM vendor '
            co(function* exec() {
                result = yield query(GetVendor,condition)
                log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'get vendor success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'get vendor error '
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
            //log.info("create vendor")
            const num = 'SELECT count(*) from vendor '
            condition = ''
            const insertVendor = 'INSERT INTO vendor (vID,name,address,city,contact,phone,companyTax,updateUser) VALUES (?,?,?,?,?,?,?,?) '
            co(function* exec() {
                result = yield query(num, condition)
                log.info(result)
                if (result) {
                    let a = JSON.stringify(result)
                    let num_g = a.match(/\d+/);
                    condition=["v"+ (parseInt(num_g[0]) + 1),req.body.name,req.body.address,req.body.city,req.body.contact,req.body.phone,req.body.companyTax,req.cookies.uID]
                    result2 = yield query(insertVendor, condition)
                    if (result2) {
                        json.code = 2001
                        json.msg = 'create vendor success '
                        json.data = result2
                        res.send(json)
                        connect.release()
                    } else {
                        log.info(err)
                        json.code = 6000
                        json.msg = 'create vendor error '
                        res.send(json)
                        connect.release()
                    }
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'create vendor error '
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
            condition=req.body.vID
            log.info("delete vendor")
            const GetVendor= 'DELETE FROM vendor WHERE vID = ? '
            co(function* exec() {
                result = yield query(GetVendor,condition)
                //log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'delete vendor success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'delete vendor error '
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
            log.info("Update vendor")
            const GetVendor = 'Update vendor set name=?,address=?,city=?,contact=?,phone=?,companyTax=?,updateUser=?  WHERE vID = ? '
            condition=[req.body.name,req.body.address,req.body.city,req.body.contact,req.body.phone,req.body.companyTax,req.cookies.uID,req.body.vID]
            co(function* exec() {
                result = yield query(GetVendor,condition)
                //log.info(result)
                if (result && result.length !== 0) {
                    json.code = 2001
                    json.msg = 'edit vendor success '
                    json.data = result
                    res.send(json)
                    connect.release()
                } else {
                    log.info(err)
                    json.code = 6000
                    json.msg = 'edit vendor error '
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