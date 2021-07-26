const express = require('express')
const mysql = require('../../model/myDB')
const sha256 = require('sha256')
const log = require('loglevel')
const co = require('co')
const Promise = require('bluebird');
const dateFormat = require('dateformat')

const router = express.Router()
const pool = mysql.getPool()

log.setDefaultLevel('INFO')

router.get('/', function (req, res, next) {
    pool.getConnection((err, connect) => {
        if (err) {
            log.error(err)
            res.send('There was a problem to the database .')
        } else {
            let condition, result
            const query = Promise.promisify(connect.query, {
                context: connect
            })
            //log.info(req.cookies.sID)
            condition = [req.cookies.sID]
            const SelectUserInfo = ' SELECT * FROM user LEFT JOIN session ON user.uID=session.uID WHERE sessionID = ? '
            co(function* exec() {
                result = yield query(SelectUserInfo, condition)
                if (result && result.length > 0) {
                    res.render('pages/profile', {
                        uID: result[0]['uID'],
                        account: result[0]['account'],
                        password: result[0]['password'],
                        username: result[0]['username'],
                        gender: result[0]['gender'],
                        birthday: dateFormat(result[0]['birthday'], 'yyyy-mm-dd'),
                        s_ID: req.cookies.sID
                    })
                    log.info("***************")
                    log.info(result[0])
                } else {
                    res.send('There was a problem adding the information to the database.')
                    log.error(err)
                }
            }).catch(err => {
                res.send('There was a problem when select user info.')
            })
        }
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
            let u_username = req.body.username
            let u_gender = req.body.gender
            let u_birthday = req.body.birthday
            let u_password = req.body.pass1
            let u_password2 = req.body.pass2
            let hex = sha256(u_password)
            condition = [u_username, u_gender, u_birthday, hex, u_ID]
            const updateUser = ' UPDATE user SET username=?,gender=?,birthday=?,password=? WHERE uID =?'
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
                json.msg = '密碼驗證錯誤'
                res.send(json)
                connect.release()
            }

        }
    })
})


module.exports = router