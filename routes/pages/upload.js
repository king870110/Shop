const express = require('express')
const mysql = require('../model/myDB')
const log = require('loglevel')
const co = require('co')
const Promise = require('bluebird');
const multer = require('multer')

const router = express.Router()
const pool = mysql.getPool()

log.setDefaultLevel('INFO')

router.get('/', function (req, res, next) {
  res.render('upload', {
    title: 'upload'
  })
})

var upload = multer({
  dest: 'upload/'
})

router.post('/', upload.single('logo'), function (req, res, next) {
  log.info(req.body)
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
    } else {
      const query = Promise.promisify(connect.query, {
        context: connect
      })
      const InsertImage = ' INSERT INTO images (iID,path) VALUES (?,?) '
      if (req.file) {
        let i_ID = 'a' + req.file.filename
        let i_path = req.file.path
        let condition, result
        condition = [i_ID, i_path]
        co(function* exec() {
          result = yield query(InsertImage, condition)
          if (result) {
            res.send('上傳成功' + '<meta http-equiv="refresh" content="2;url=/" />')
            connect.release()
            log.info(req.file.path+'/'+req.file.filename)
          } else {
            res.send('上傳失敗，請重新上傳' + '<meta http-equiv="refresh" content="2;url=/upload" />')
            connect.release()
            fs.unlink(req.file.path+'/'+req.file.filename, (err) => {
              if (err) throw err;
              console.log('文件已删除');
              res.send('文件已刪除' + '<meta http-equiv="refresh" content="2;url=/upload" />')
            });
          }
        }).catch(err => {
          log.info(err)
          json.code = 6000
          json.msg = 'database is having a problem '
          res.send(json)
          connect.release()
        })
      } else {
        res.send('檔案有誤或是未選擇檔案' + '<meta http-equiv="refresh" content="0;url=/upload" />')
        connect.release()
      }
    }
  })
})

module.exports = router