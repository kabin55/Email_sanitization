import express from 'express'
import multer from 'multer'
import {
  validateEmail,
  validateEmailFile
} from '../controllers/email.controller.js'

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post('/validate', validateEmail)
// router.post('/validate-file', upload.single('file'), validateEmailFile)
router.post('/upload', upload.single('file'), validateEmailFile)


export default router
