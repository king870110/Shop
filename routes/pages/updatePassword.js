const express = require('express')
const mysql = require('../../model/myDB')
const sha256 = require('sha256')
const log = require('loglevel')
const co = require('co')
const Promise = require('bluebird');

const router = express.Router()
const pool = mysql.getPool()

log.setDefaultLevel('INFO')

router.get('/', function (req, res, next) {
    res.render('pages/updatePassword', {
        s_ID: req.cookies.sID
      })
})

router.post('/', function (req, res, next) {
    pool.getConnection((err, connect) => {
        let json = {
            code: 2000,
            data: {},
            msg: ''
        }
        if (err) {
            log.error(err)
            json.code = 6000
            json.msg = 'connect error'
            res.send(json)
        } else {
            let condition, result
            const query = Promise.promisify(connect.query, {
                context: connect
            })
            console.log(req.body)
            let u_ID = req.body.uID
            let u_password = req.body.password
            let u_password2 = req.body.password2
            let hex = sha256(u_password)
            condition = [hex, u_ID]
            const updateUser = ' UPDATE user SET password=? WHERE uID =?'
            if (u_password === u_password2 && u_password) {
                co(function* exec() {
                    result = yield query(updateUser, condition)
                    if (result) {
                        json.code = 2001
                        json.msg = '更改資料成功'
                        res.send(json)
                        connect.release()
                    } else {
                        json.code = 6000
                        json.msg = '更改資料失敗'
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
            } else {
                json.code = 6000
                json.msg = '更改資料失敗'
                res.send(json)
                connect.release()
            }
        }
    })
})




module.exports = router