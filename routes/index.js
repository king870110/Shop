const express = require('express')
const mysql = require('../model/myDB')
const log = require('loglevel')
const co = require('co')
const Promise = require('bluebird');

const router = express.Router()
const pool = mysql.getPool()

log.setDefaultLevel('INFO')

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  })
})

router.post('/', function (req, res, next) {
  
})

module.exports = router