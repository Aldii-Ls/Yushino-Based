import path from 'path'
import { toAudio } from './converter.js'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import got from 'got'
import Jimp from 'jimp'
import util from 'util'
import { fileURLToPath } from 'url'
import Connection from './connection.js'
import { Readable } from 'stream'
import Helper from './helper.js'
import { resize, stream2buffer } from './func.js'
import { fileTypeFromBuffer } from 'file-type'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {typeof import('@whiskeysockets/baileys')} */ // @ts-ignore
const {
areJidsSameUser,
downloadContentFromMessage,
extractMessageContent,
generateForwardMessageContent,
generateWAMessage,
generateWAMessageFromContent,
getContentType,
jidDecode,
prepareWAMessageMedia,
proto,
toReadable
} = (await import('@whiskeysockets/baileys')).default

/** 
* @param {import('./connection').Socket} conn 
* @param {{
*  store: typeof import('./connection')['default']['store']
*  logger: import('./connection.js').Logger
* }} options
*/
export function HelperConnection(conn, { store, logger }) {
const botUser = conn.user || {}

/** @type {import('@whiskeysockets/baileys').WASocket} */
let sock = Object.defineProperties(conn, {
        
decodeJid: {
value(jid) {
if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null
// @ts-ignore
return jid?.decodeJid?.()
}
},
logger: {
value: {
...logger,
info: logger.info?.bind(logger),
error: logger.error?.bind(logger),
warn: logger.warn?.bind(logger),
fatal: logger.fatal?.bind(logger),
debug: logger.debug?.bind(logger),
trace: logger.trace?.bind(logger)
},
enumerable: true,
writable: true
},
getFile: {
async value(PATH, saveToFile = false) {
let filename, type, fullpath, data
if (Buffer.isBuffer(PATH)) data = PATH
else if (PATH instanceof ArrayBuffer) data = PATH.toBuffer()
else if (Helper.isReadableStream(PATH)) data = await stream2buffer(PATH)
else if (/^data:.*?\/.*?;base64,/i.test(PATH)) data = Buffer.from(PATH.split`,`[1], 'base64')
else if (fs.existsSync(PATH)) data = fs.readFileSync(PATH)
else if (/^https?:\/\//.test(PATH)) {
data = await got(PATH, { responseType: 'buffer', throwHttpErrors: false })
if (data.headers['content-disposition']) {
try {
filename = decodeURIComponent(data.headers['content-disposition'].split(';').find(n => n.includes('filename=')).replace(/filename=|"/g, '').trim())
} catch {}
}
data = data.body ?? data.rawBody
} else data = Buffer.alloc(0)

try {
fs.statSync(PATH).isFile()
filename = path.basename(PATH)
fullpath = path.resolve(PATH)
} catch {}

if (Buffer.byteLength(data) > 2000000000) throw new TypeError('Canceled process... WhatsApp 2GB File Sharing Limit exceeds')
if ((filename || '').split('.').pop() == 'apk') type = { mime: 'application/vnd.android.package-archive', ext: 'apk' }
else type = await fileTypeFromBuffer(data) || { mime: 'application/octet-stream', ext: 'bin' }
if (saveToFile) {
filename = `${Date.now()}.${type.ext}`
fullpath = path.join(__dirname, `../tmp/${filename}`)
fs.writeFileSync(fullpath, data)
}
return {
filename,
fullpath,
...type,
data,
async clear() {
data.fill(0)
}
}
},
enumerable: true,
writable: true,
},
// waitEvent: {
//     /**
//      * waitEvent
//      * @param {String} eventName 
//      * @param {Boolean} is 
//      * @param {Number} maxTries 
//      */
//     value(eventName, is = () => true, maxTries = 25) { //Idk why this exist?
//         return new Promise((resolve, reject) => {
//             let tries = 0
//             let on = (...args) => {
//                 if (++tries > maxTries) reject('Max tries reached')
//                 else if (is()) {
//                     conn.ev.off(eventName, on)
//                     resolve(...args)
//                 }
//             }
//             conn.ev.on(eventName, on)
//         })
//     }
// },
resize: {
async value(buffer, width, height) {
	var oyy = await Jimp.read(buffer);
	var kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG)
	return kiyomasa
},
enumerable: true,
writable: true
},

font: {
async value(text, style = 1) {
var xStr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
var yStr = Object.freeze({
1: ['ᴀ', 'ʙ', 'ᴄ', 'ᴅ', 'ᴇ', 'ꜰ', 'ɢ', 'ʜ', 'ɪ', 'ᴊ', 'ᴋ', 'ʟ', 'ᴍ', 'ɴ', 'ᴏ', 'ᴘ', 'q', 'ʀ', 'ꜱ', 'ᴛ', 'ᴜ', 'ᴠ', 'ᴡ', 'x', 'ʏ', 'ᴢ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
2: ['𝑎', '𝑏', '𝑐', '𝑑', '𝑒', '𝑓', '𝑔', 'ℎ', '𝑖', '𝑗', '𝑘', '𝑙', '𝑚', '𝑛', '𝑜', '𝑝', '𝑞', '𝑟', '𝑠', '𝑡', '𝑢', '𝑣', '𝑤', '𝑥', '𝑦', '𝑧', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
3: ['𝐚', '𝐛', '𝐜', '𝐝', '𝐞', '𝐟', '𝐠', '𝐡', '𝐢', '𝐣', '𝐤', '𝐥', '𝐦', '𝐧', '𝐨', '𝐩', '𝐪', '𝐫', '𝐬', '𝐭', '𝐮', '𝐯', '𝐰', '𝐱', '𝐲', '𝐳', '𝟏', '𝟐', '𝟑', '𝟒', '𝟓', '𝟔', '𝟕', '𝟖', '𝟗', '𝟎'],
4: ['𝒂', '𝒃', '𝒄', '𝒅', '𝒆', '𝒇', '𝒈', '𝒉', '𝒊', '𝒋', '𝒌', '𝒍', '𝒎', '𝒏', '𝒐', '𝒑', '𝒒', '𝒓', '𝒔', '𝒕', '𝒖', '𝒗', '𝒘', '𝒙', '𝒚', '𝒛', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
5: ['𝗮', '𝗯', '𝗰', '𝗱', '𝗲', '𝗳', '𝗴', '𝗵', '𝗶', '𝗷', '𝗸', '𝗹', '𝗺', '𝗻', '𝗼', '𝗽', '𝗾', '𝗿', '𝘀', '𝘁', '𝘂', '𝘃', '𝘄', '𝘅', '𝘆', '𝘇', '𝟭', '𝟮', '𝟯', '𝟰', '𝟱', '𝟲', '𝟳', '𝟴', '𝟵', '𝟬'],
6: ['ᵃ', 'ᵇ', 'ᶜ', 'ᵈ', 'ᵉ', 'ᶠ', 'ᵍ', 'ʰ', 'ⁱ', 'ʲ', 'ᵏ', 'ˡ', 'ᵐ', 'ⁿ', 'ᵒ', 'ᵖ', 'ᵠ', 'ʳ', 'ˢ', 'ᵗ', 'ᵘ', 'ᵛ', 'ʷ', 'ˣ', 'ʸ', 'ᶻ', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁰'],
7: ['ᗩ', 'ᗷ', 'ᑕ', 'ᗪ', 'ᗴ', 'ᖴ', 'ᘜ', 'ᕼ', 'I', 'ᒍ', 'K', 'ᒪ', 'ᗰ', 'ᑎ', 'O', 'ᑭ', 'ᑫ', 'ᖇ', 'Տ', 'T', 'ᑌ', 'ᐯ', 'ᗯ', '᙭', 'Y', 'ᘔ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
8: ['𝙖', '𝙗', '𝙘', '𝙙', '𝙚', '𝙛', '𝙜', '𝙝', '𝙞', '𝙟', '𝙠', '𝙡', '𝙢', '𝙣', '𝙤', '𝙥', '𝙦', '𝙧', '𝙨', '𝙩', '𝙪', '𝙫', '𝙬', '𝙭', '𝙮', '𝙯', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
9: ['𝘢', '𝘣', '𝘤', '𝘥', '𝘦', '𝘧', '𝘨', '𝘩', '𝘪', '𝘫', '𝘬', '𝘭', '𝘮', '𝘯', '𝘰', '𝘱', '𝘲', '𝘳', '𝘴', '𝘵', '𝘶', '𝘷', '𝘸', '𝘹', '𝘺', '𝘻', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
10: ['𝖺', '𝖻', '𝖼', '𝖽', '𝖾', '𝖿', '𝗀', '𝗁', '𝗂', '𝗃', '𝗄', '𝗅', '𝗆', '𝗇', '𝗈', '𝗉', '𝗊', '𝗋', '𝗌', '𝗍', '𝗎', '𝗏', '𝗐', '𝗑', '𝗒', '𝗓', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
11: ['Ⓐ︎', 'Ⓑ', '︎Ⓒ', '︎Ⓓ︎', 'Ⓔ︎', 'Ⓕ︎', 'Ⓖ︎', 'Ⓗ︎', 'Ⓘ︎', 'Ⓙ︎', 'Ⓚ︎', 'Ⓛ︎', 'Ⓜ︎', 'Ⓝ︎', 'Ⓞ︎', 'Ⓟ', '︎Ⓠ︎', 'Ⓡ︎', 'Ⓢ', '︎Ⓣ︎', 'Ⓤ︎', 'Ⓥ︎', 'Ⓦ︎', 'Ⓧ︎', 'Ⓨ︎', 'Ⓩ︎', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
12: ['🅐︎', '🅑︎', '🅒', '︎🅓︎', '🅔︎', '🅕︎', '🅖︎', '🅗', '︎🅘︎', '🅙︎', '🅚', '︎🅛︎', '🅜', '︎🅝︎', '🅞', '︎🅟', '︎🅠︎', '🅡︎', '🅢', '︎🅣', '︎🅤', '︎🅥︎', '🅦︎', '🅧︎', '🅨︎', '🅩︎', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
13: ['卂', '乃', '匚', 'ᗪ', '乇', '千', 'ᘜ', '卄', '|', 'ﾌ', 'Ҝ', 'ㄥ', '爪', '几', 'ㄖ', '卩', 'Ҩ', '尺', '丂', 'ㄒ', 'ㄩ', 'ᐯ', '山', '乂', 'ㄚ', '乙', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
14: ['ⓐ', 'ⓑ', 'ⓒ', 'ⓓ', 'ⓔ', 'ⓕ', 'ⓖ', 'ⓗ', 'ⓘ', 'ⓙ', 'ⓚ', 'ⓛ', 'ⓜ', 'ⓝ', 'ⓞ', 'ⓟ', 'ⓠ', 'ⓡ', 'ⓢ', 'ⓣ', 'ⓤ', 'ⓥ', 'ⓦ', 'ⓧ', 'ⓨ', 'ⓩ', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⓪'],
15: ['𝚊', '𝚋', '𝚌', '𝚍', '𝚎', '𝚏', '𝚐', '𝚑', '𝚒', '𝚓', '𝚔', '𝚕', '𝚖', '𝚗', '𝚘', '𝚙', '𝚚', '𝚛', '𝚜', '𝚝', '𝚞', '𝚟', '𝚠', '𝚡', '𝚢', '𝚣', '𝟷', '𝟸', '𝟹', '𝟺', '𝟻', '𝟼', '𝟽', '𝟾', '𝟿', '𝟶'],
16: ['a͢', 'b͢', 'c͢', 'd͢', 'e͢', 'f͢', 'g͢', 'h͢', 'i͢', 'j͢', 'k͢', 'l͢', 'm͢', 'n͢', 'o͢', 'p͢', 'q', '͢r', '͢s͢', 't', '͢u', '͢v͢', 'w͢', 'x͢', 'y', '͢z', '͢1͢', '2͢', '3', '͢4͢', '5͢', '6͢', '7͢', '8͢', '9͢', '0͢'],
17: ['𝕒', '𝕓', '𝕔', '𝕕', '𝕖', '𝕗', '𝕘', '𝕙', '𝕚', '𝕛', '𝕜', '𝕝', '𝕞', '𝕟', '𝕠', '𝕡', '𝕢', '𝕣', '𝕤', '𝕥', '𝕦', '𝕧', '𝕨', '𝕩', '𝕪', '𝕫', '𝟙', '𝟚', '𝟛', '𝟜', '𝟝', '𝟞', '𝟟', '𝟠', '𝟡', '𝟘'],
18: ['【a】', '【b】', '【c】', '【d】', '【e】', '【f】', '【g】', '【h】', '【i】', '【j】', '【k】', '【l】', '【m】', '【n】', '【o】', '【p】', '【q】', '【r】', '【s】', '【t】', '【u】', '【v】', '【w】', '【x】', '【y】', '【z】', '【1】', '【2】', '【3】', '【4】', '【5】', '【6】', '【7】', '【8】', '【9】', '【0】'],
19: ['ａ', 'ｂ', 'ｃ', 'ｄ', 'ｅ', 'ｆ', 'ｇ', 'ｈ', 'ｉ', 'ｊ', 'ｋ', 'ｌ', 'ｍ', 'ｎ', 'ｏ', 'ｐ', 'ｑ', 'ｒ', 'ｓ', 'ｔ', 'ｕ', 'ｖ', 'ｗ', 'ｘ', 'ｙ', 'ｚ', '１', '２', '３', '４', '５', '６', '７', '８', '９', '０'],
20: ['『a』', '『b』', '『c』', '『d』', '『e』', '『f』', '『g』', '『h』', '『i』', '『j』', '『k』', '『l』', '『m』', '『n』', '『o』', '『p』', '『q』', '『r』', '『s』', '『t』', '『u』', '『v』', '『w』', '『x』', '『y』', '『z』', '『1』', '『2』', '『3』', '『4』', '『5』', '『6』', '『7』', '『8』', '『9』', '『0』'],
21: ['𝐀','𝐁','𝐂','𝐃','𝐄','𝐅','𝐆','𝐇','𝐈','𝐉','𝐊','𝐋','𝐌','𝐍','𝐎','𝐏','𝐐','𝐑','𝐒','𝐓','𝐔','𝐕','𝐖','𝐗','𝐘','𝐙','1','2','3','4','5','6','7','8','9','0'],
})

var replacer = []
xStr.map((v, i) => replacer.push({
original: v,
convert: yStr[style][i]
}))
var str = text.toLowerCase().split('')
var output = []
str.map(v => {
const find = replacer.find(x => x.original == v)
find ? output.push(find.convert) : output.push(v)
})
return output.join('')
},
enumerable: true,
writable: true
},

sendMsg: {
async value(jid, message = {}, options = {}) {
return await conn.sendMessage(jid, message, { ...options, backgroundColor: '', ephemeralExpiration: 86400 })
},
enumerable: true,
writable: true
},

sendFThumb: {
async value(jid, title, text = '', thumbnailUrl, sourceUrl, quoted, LargerThumbnail = true, AdAttribution = true) {
return conn.sendMsg(jid, { ...{
contextInfo: {
mentionedJid: await conn.parseMention(text),
externalAdReply: {
title: title,
body: null,
mediaType: 1,
previewType: 0,
showAdAttribution: AdAttribution,
renderLargerThumbnail: LargerThumbnail,
thumbnailUrl: thumbnailUrl,
sourceUrl: sourceUrl
},
},
}, text }, { quoted })
},
enumerable: true,
writable: true,
},
sendFAudio: {
async value(jid, audioinfo = {}, m, title, thumbnailUrl, sourceUrl, body = '', LargerThumbnail = true, AdAttribution = true) {
return await conn.sendMsg(jid, {
...audioinfo,
contextInfo: {
externalAdReply: {
title: title,
body: body,
thumbnailUrl: thumbnailUrl,
sourceUrl: sourceUrl,
mediaType: 1,
showAdAttribution: AdAttribution,
renderLargerThumbnail: LargerThumbnail
}
}
}, { quoted: m })
},
enumerable: true,
writable: true,
},
sendFile: {
/**
* Send Media/File with Automatic Type Specifier
* @param {String} jid
* @param {String|Buffer} path
* @param {String} filename
* @param {String} caption
* @param {import('@adiwajshing/baileys').proto.WebMessageInfo} quoted
* @param {Boolean} ptt
* @param {Object} options
*/
async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}, isConvert = false) {
const file = await conn.getFile(path)
let mtype = '',
buffer = file.data,
mimetype = options.mimetype || file.mime,
convert
const opt = {}

if (quoted) opt.quoted = quoted
if (!file.ext === '.bin') options.asDocument = true

if (/webp/.test(mimetype) || (/image/.test(mimetype) && options.asSticker)) mtype = 'sticker'
else if (/image/.test(mimetype) || (/webp/.test(mimetype) && options.asImage)) mtype = 'image'
else if (/video/.test(mimetype)) mtype = 'video'
else if (/audio/.test(mimetype)) {
mtype = 'audio'
mimetype = options.mimetype || file.mime || 'audio/mpeg'
if (isConvert) {
convert = await toAudio(buffer, file.ext)
buffer = await convert.toBuffer()
mimetype = 'audio/mpeg'
}
}
else mtype = 'document'
if (options.asDocument) mtype = 'document'
if (Buffer.byteLength(buffer) > 70000000) mtype = 'document'

delete options.asSticker
delete options.asLocation
delete options.asVideo
delete options.asDocument
delete options.asImage

let message = {
...options,
caption,
ptt,
[mtype]: buffer,
mimetype,
fileName: filename || file.filename || `file.${file.ext}`
}
let error = false
try {
return await conn.sendMsg(jid, message, { ...opt, ...options })
} catch (e) {
console.error(e)
error = e
} finally {
file.clear()
if (error) throw error
}
},
enumerable: true,
writable: true,
},
sendContact: {
/**
* Send Contact
* @param {String} jid 
* @param {String[][]|String[]} data
* @param {import('@whiskeysockets/baileys').proto.WebMessageInfo} quoted 
* @param {Object} options 
*/
async value(jid, data, quoted, options = {}) {
if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
const contacts = []
for (let [number, name] of data) {
number = number.replace(/[^0-9]/g, '')
let njid = number + '@s.whatsapp.net'
let biz = await conn.getBusinessProfile(njid).catch(_ => null) || {}
let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}${biz.description ? `
X-WA-BIZ-NAME:${(store.getContact(njid)?.vname || conn.getName(njid) || name).replace(/\n/, '\\n')}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, '\\n')}
`.trim() : ''}
END:VCARD
`.trim()
contacts.push({ vcard, displayName: name })

}
return await conn.sendMsg(jid, {
...options,
contacts: {
...options,
displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
contacts,
}
}, { quoted, ...options })
},
enumerable: true,
writable: true,
},

sendContactArray: {
      async value(jid, data, quoted, options) {
        if (!Array.isArray(data[0]) && typeof data[0] === "string")
          data = [data];
        let contacts = [];
        for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5] of data) {
          number = number.replace(/[^0-9]/g, "");
          let njid = number + "@s.whatsapp.net";
          let biz =
            (await conn.getBusinessProfile(njid).catch((_) => null)) || {};
          // N:;${name.replace(/\n/g, '\\n').split(' ').reverse().join(';')};;;
          let vcard = `
BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:${name.replace(/\n/g, "\\n")}
item.ORG:${isi}
item1.TEL;waid=${number}:${PhoneNumber("+" + number).getNumber("international")}
item1.X-ABLabel:${isi1}
item2.EMAIL;type=INTERNET:${isi2}
item2.X-ABLabel:📧 Email
item3.ADR:;;${isi3};;;;
item3.X-ABADR:ac
item3.X-ABLabel:📍 Region
item4.URL:${isi4}
item4.X-ABLabel:Website
item5.X-ABLabel:${isi5}
END:VCARD`.trim();
          contacts.push({ vcard, displayName: name });
        }
        return await conn.sendMessage(
          jid,
          {
            contacts: {
              displayName:
                (contacts.length > 1
                  ? `2013 kontak`
                  : contacts[0].displayName) || null,
              contacts,
            },
          },
          {
            quoted,
            ...options,
          }
        );
      },
    },
    
sendButton:  {
      async value(jid, text = '', footer = '', buffer, buttons, copy, urls, quoted, options) {
          let img, video
          if (/^https?:\/\//i.test(buffer)) {
              try {

                  const response = await fetch(buffer)
                  const contentType = response.headers.get('content-type')
                  if (/^image\//i.test(contentType)) {
                      img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                  } else if (/^video\//i.test(contentType)) {
                      video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                  } else {
                      console.error("Filetype not supported", contentType)
                  }
              } catch (error) {
                  console.error("Failed to detect File type", error)
              }
          } else {

              try {
                  const type = await conn.getFile(buffer)
                 if (/^image\//i.test(type.mime)) {
                      img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                  } else if (/^video\//i.test(type.mime)) {
                      video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                  }
              } catch (error) {
                  console.error("Error getting file type", error);
              }
          }

          const newbtns = buttons.map(btn => ({
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                  display_text: btn[0],
                  id: btn[1]
              }),
          }));

          if (copy && Array.isArray(copy)) {
          copy.forEach(cop => {
          newbtns.push({
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                  display_text: cop[0],
                  copy_code: cop[1]
              })
          })
          })
          }
          
          if (urls && Array.isArray(urls)) {
              urls.forEach(url => {
                  newbtns.push({
                      name: 'cta_url',
                      buttonParamsJson: JSON.stringify({
                          display_text: url[0],
                          url: url[1],
                          merchant_url: url[1]
                      })
                  })
              })
          }


          const interactiveMessage = {
              body: { text: text },
              footer: { text: footer },
              header: {
                  hasMediaAttachment: false,
                  imageMessage: img ? img.imageMessage : null,
                  videoMessage: video ? video.videoMessage : null
              },
              nativeFlowMessage: {
                  buttons: newbtns,
                  messageParamsJson: ''
              }
          }


          let msgL = generateWAMessageFromContent(jid, {
              viewOnceMessage: {
                  message: {
                      interactiveMessage } } }, { userJid: conn.user.jid, quoted })

         conn.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options })

      }
  }, 

sendButtonC:  {
      async value(jid, text = '', footer = '', buffer, buttons, urls, quoted, options) {
          let img, video
          if (/^https?:\/\//i.test(buffer)) {
              try {

                  const response = await fetch(buffer)
                  const contentType = response.headers.get('content-type')
                  if (/^image\//i.test(contentType)) {
                      img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                  } else if (/^video\//i.test(contentType)) {
                      video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                  } else {
                      console.error("Filetype not supported", contentType)
                  }
              } catch (error) {
                  console.error("Failed to detect File type", error)
              }
          } else {

              try {
                  const type = await conn.getFile(buffer)
                 if (/^image\//i.test(type.mime)) {
                      img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                  } else if (/^video\//i.test(type.mime)) {
                      video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                  }
              } catch (error) {
                  console.error("Error getting file type", error);
              }
          }

          const newbtns = buttons.map(copy => ({
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                  display_text: copy[0],
                  copy_code: copy[1]
              }),
          }));

          if (urls && Array.isArray(urls)) {
              urls.forEach(url => {
                  newbtns.push({
                      name: 'cta_url',
                      buttonParamsJson: JSON.stringify({
                          display_text: url[0],
                          url: url[1],
                          merchant_url: url[1]
                      })
                  })
              })
          }


          const interactiveMessage = {
              body: { text: text },
              footer: { text: footer },
              header: {
                  hasMediaAttachment: false,
                  imageMessage: img ? img.imageMessage : null,
                  videoMessage: video ? video.videoMessage : null
              },
              nativeFlowMessage: {
                  buttons: newbtns,
                  messageParamsJson: ''
              }
          }


          let msgL = generateWAMessageFromContent(jid, {
              viewOnceMessage: {
                  message: {
                      interactiveMessage } } }, { userJid: conn.user.jid, quoted })

         conn.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options })

      }
  }, 
      
reply: {
			/**
			 * Reply to a message
			 * @param {String} jid
			 * @param {String|Buffer} text
			 * @param {import('@whiskeysockets/baileys').proto.WebMessageInfo} quoted
			 * @param {Object} options
			 */
			value(jid, text = '', quoted, options = {}) {
				return Buffer.isBuffer(text) ? conn.sendFile(jid, text, 'file', '', quoted, false, options) : conn.sendMsg(jid, { ...options, text }, { quoted, ...options })
			},
			writable: true,
		},
		sendPoll: {
            async value(jid, name = '', optiPoll, options) {
                if (!Array.isArray(optiPoll[0]) && typeof optiPoll[0] === 'string') optiPoll = [optiPoll]
                if (!options) options = {}
                const pollMessage = {
        name: name,
        options: optiPoll.map(btn => ({
                            optionName: !nullish(btn[0]) && btn[0] || ''
                    })),
                    selectableOptionsCount: 1
        }
                return conn.relayMessage(jid, { pollCreationMessage: pollMessage }, { ...options });
                }
        },
// TODO: Fix sendLocation
// Maybe aploud buffer to whatsapp first and then send location
sendHydrated: {
/**
* 
* @param {String} jid 
* @param {String} text 
* @param {String} footer 
* @param {fs.PathLike} buffer
* @param {String|string[]} url
* @param {String|string[]} urlText
* @param {String|string[]} call
* @param {String|string[]} callText
* @param {String[][]} buttons
* @param {import('@whiskeysockets/baileys').proto.WebMessageInfo} quoted
* @param {Object} options
*/
async value(jid, text = '', footer = '', buffer, url, urlText, call, callText, buttons, quoted, options = {}) {
let file
if (buffer) {
try {
file = await conn.getFile(buffer)
buffer = file.data
} catch (e) {
console.error(e)
file = buffer = null
}
}

if (!/image/.test(file.mime)) {
options = quoted
quoted = buttons
buttons = callText
callText = call
call = urlText
urlText = url
url = file.fullpath
buffer = null
}

if (!options) options = {}
let templateButtons = []
if (url || urlText) {
if (!Array.isArray(url)) url = [url]
if (!Array.isArray(urlText)) urlText = [urlText]
templateButtons.push(...(
url.map((v, i) => [v, urlText[i]])
.map(([url, urlText], i) => ({
index: templateButtons.length + i + 1,
urlButton: {
displayText: !nullish(urlText) && urlText || !nullish(url) && url || '',
url: !nullish(url) && url || !nullish(urlText) && urlText || ''
}
})) || []
))
}
if (call || callText) {
if (!Array.isArray(call)) call = [call]
if (!Array.isArray(callText)) callText = [callText]
templateButtons.push(...(
call.map((v, i) => [v, callText[i]])
.map(([call, callText], i) => ({
index: templateButtons.length + i + 1,
callButton: {
displayText: !nullish(callText) && callText || !nullish(call) && call || '',
phoneNumber: !nullish(call) && call || !nullish(callText) && callText || ''
}
})) || []
))
}
if (buttons.length) {
if (!Array.isArray(buttons[0])) buttons = [buttons]
templateButtons.push(...(
buttons.map(([text, id], index) => ({
index: templateButtons.length + index + 1,
quickReplyButton: {
displayText: !nullish(text) && text || !nullish(id) && id || '',
id: !nullish(id) && id || !nullish(text) && text || ''
}
})) || []
))
}
let message = {
...options,
[buffer ? 'caption' : 'text']: text || '',
footer,
templateButtons,
...(buffer ?
options.asLocation && /image/.test(file.mime) ? {
location: {
...options,
jpegThumbnail: await resize(await buffer, 300, 169)
}
} : {
[/video/.test(file.mime) ? 'video' : /image/.test(file.mime) ? 'image' : 'document']: buffer,
mimetype: file.mime
} : {})
}

let error = false
try {
return await conn.sendMsg(jid, message, {
quoted,
upload: conn.waUploadToServer,
...options
})
} catch (e) {
error = e
console.error(e)
} finally {
if (file) file.clear()
if (error) throw error
}
},
enumerable: true,
writable: true,
},
sendList: {
      async value(jid, title, text, buttonText, buffer, listSections, quoted, options = {}) {
        let img, video
          if (/^https?:\/\//i.test(buffer)) {
              try {

                  const response = await fetch(buffer)
                  const contentType = response.headers.get('content-type')
                  if (/^image\//i.test(contentType)) {
                      img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                  } else if (/^video\//i.test(contentType)) {
                      video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                  } else {
                      console.error("File Type Not Supported", contentType)
                  }
              } catch (error) {
                  console.error("Error getting File type", error)
              }
          } else {

              try {
                  const type = await conn.getFile(buffer)
                 if (/^image\//i.test(type.mime)) {
                      img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer })
                  } else if (/^video\//i.test(type.mime)) {
                      video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer })
                  }
              } catch (error) {
                  console.error("Error getting file type", error);
              }
          }

    const sections = [...listSections]

          const message = {
              interactiveMessage: {
                  header: {title: title, 
                  hasMediaAttachment: false,
                  imageMessage: img ? img.imageMessage : null,
                  videoMessage: video ? video.videoMessage : null 
                     } ,
                  body: {text: text}, 
                  nativeFlowMessage: {
                      buttons: [
                          {
                              name: 'single_select',
                              buttonParamsJson: JSON.stringify({
                                  title: buttonText,
                                  sections
                              })
                          }
                      ],
                      messageParamsJson: ''
                  }
              }
          };

          let msgL = generateWAMessageFromContent(jid, {
              viewOnceMessage: {
                  message} }, { userJid: conn.user.jid, quoted })


          conn.relayMessage(jid, msgL.message, { messageId: msgL.key.id, ...options })

      }
  },
cMod: {
/**
* cMod
* @param {String} jid 
* @param {import('@whiskeysockets/baileys').proto.WebMessageInfo} message 
* @param {String} text 
* @param {String} sender 
* @param {*} options 
* @returns 
*/
value(jid, message, text = '', sender = conn.user.jid, options = {}) {
if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions]
let copy = message.toJSON()
delete copy.message.messageContextInfo
delete copy.message.senderKeyDistributionMessage
let mtype = Object.keys(copy.message)[0]
let msg = copy.message
let content = msg[mtype]
if (typeof content === 'string') msg[mtype] = text || content
else if (content.caption) content.caption = text || content.caption
else if (content.text) content.text = text || content.text
if (typeof content !== 'string') {
msg[mtype] = { ...content, ...options }
msg[mtype].contextInfo = {
...(content.contextInfo || {}),
mentionedJid: options.mentions || content.contextInfo?.mentionedJid || []
}
}
if (copy.participant) sender = copy.participant = sender || copy.participant
else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
copy.key.remoteJid = jid
copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false
return proto.WebMessageInfo.fromObject(copy)
},
enumerable: true,
writable: true,
},
copyNForward: {
/**
* Exact Copy Forward
* @param {String} jid
* @param {import('@whiskeysockets/baileys').proto.WebMessageInfo} message
* @param {Boolean|Number} forwardingScore
* @param {Object} options
*/
async value(jid, message, forwardingScore = true, options = {}) {
let vtype
if (options.readViewOnce && message.message.viewOnceMessage?.message) {
vtype = Object.keys(message.message.viewOnceMessage.message)[0]
delete message.message.viewOnceMessage.message[vtype].viewOnce
message.message = proto.Message.fromObject(
JSON.parse(JSON.stringify(message.message.viewOnceMessage.message))
)
message.message[vtype].contextInfo = message.message.viewOnceMessage.contextInfo
}
let mtype = getContentType(message.message)
let m = generateForwardMessageContent(message, !!forwardingScore)
let ctype = getContentType(m)
if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) m[ctype].contextInfo.forwardingScore += forwardingScore
m[ctype].contextInfo = {
...(message.message[mtype].contextInfo || {}),
...(m[ctype].contextInfo || {})
}
m = generateWAMessageFromContent(jid, m, {
...options,
userJid: conn.user.jid
})
await conn.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: options })
return m
},
enumerable: true,
writable: true,
},
fakeReply: {
/**
* Fake Replies
* @param {String} jid
* @param {String|Object} text
* @param {String} fakeJid
* @param {String} fakeText
* @param {String} fakeGroupJid
* @param {String} options
*/
value(jid, text = '', fakeJid = this.user.jid, fakeText = '', fakeGroupJid, options = {}) {
return conn.reply(jid, text, { key: { fromMe: areJidsSameUser(fakeJid, conn.user.id), participant: fakeJid, ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}) }, message: { conversation: fakeText }, ...options })
},
writable: true,
},
downloadM: {
/**
* Download media message
* @param {Object} m
* @param {String} type
* @param {{
*  saveToFile?: fs.PathLike | fs.promises.FileHandle;
*  asStream?: boolean
* }} opts
* @returns {Promise<fs.PathLike | fs.promises.FileHandle | Buffer>} the return will string, which is a filename if `opts.saveToFile` is `'true'`
*/
async value(m, type, opts) {
let fullpath
if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
const stream = await downloadContentFromMessage(m, type == 'ptv' ? 'video' : type)

// Use push to fix performance issue
let buffers = []
for await (const chunk of stream) buffers.push(chunk)
buffers = await Buffer.concat(buffers)
if (opts.asStream) buffers = await toReadable(buffers)

// Destroy the stream
stream.destroy()

// If saveToFile is true, call getFile function to save file and then get filename
if (opts.saveToFile) ({ fullpath } = await conn.getFile(buffers, true))
return opts.saveToFile && fs.existsSync(fullpath) ? fullpath : buffers
},
enumerable: true,
writable: true,
},
parseMention: {
/**
* Parses string into mentionedJid(s)
* @param {String} text
* @returns {Array<String>}
*/
value(text = '') {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
},
enumerable: true,
writable: true,
},
getName: {
/**
* Get name from jid
* @param {String} jid
* @param {Boolean} withoutContact
*/
value(jid = '', withoutContact = false) {
jid = conn.decodeJid(jid)
withoutContact = conn.withoutContact || withoutContact
let v
if (jid.endsWith('@g.us')) return (async () => {
v = await store.fetchGroupMetadata(jid, conn.groupMetadata) || {}
return (v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
})()

else v = jid === '0@s.whatsapp.net' ? {
jid,
vname: 'WhatsApp'
} : areJidsSameUser(jid, conn.user?.id || '') ?
conn.user :
(store.getContact(jid) || {})
return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
},
enumerable: true,
writable: true,
},
loadMessage: {
/**
* 
* @param {String} messageID 
* @returns {import('@whiskeysockets/baileys').proto.WebMessageInfo}
*/
value(jid, id) {
if (!jid && !id) return null
// if only 1 argument is passed, it is assumed to be a message id not a jid
if (jid && !id) [id, jid] = [jid, null]
return jid && id ? store.loadMessage(jid, id) : store.loadMessage(id)
},
enumerable: true,
writable: true,
},
// TODO: Fix xml-notwell-format
sendGroupV4Invite: {
/**
* sendGroupV4Invite
* @param {String} jid 
* @param {*} groupJid 
* @param {String} inviteCode 
* @param {Number} inviteExpiration 
* @param {String} groupName 
* @param {String} caption 
* @param {Buffer} jpegThumbnail
* @param {*} options 
*/
async value(jid, groupJid, inviteCode, inviteExpiration, groupName, jpegThumbnail, caption = 'Invitation to join my WhatsApp Group', options = {}) {
// inspired from https://github.com/Hisoka-Morrou/hisoka-baileys/blob/master/lib/serialize.js
const media = await prepareWAMessageMedia({ image: (await conn.getFile(jpegThumbnail)).data }, { upload: conn.waUploadToServer })
const message = proto.Message.fromObject({})
message.groupInviteMessage = {
groupJid,
inviteCode,
inviteExpiration: inviteExpiration ? parseInt(inviteExpiration) : +new Date(new Date() + (3 * 86400000)),
groupName,
jpegThumbnail: media.imageMessage?.jpegThumbnail || jpegThumbnail,
caption
}
const m = generateWAMessageFromContent(jid, message, { userJid: conn.user?.id })
await conn.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: { ...options } })
return m
},
enumerable: true,
writable: true
},

setBio: {
async value (status) {
return await conn.query({
tag: 'iq',
attrs: {
to: 's.whatsapp.net',
type: 'set',
xmlns: 'status',
},
content: [
{
tag: 'status',
attrs: {},
content: Buffer.from(status, 'utf-8')
}
]
})
// <iq to="s.whatsapp.net" type="set" xmlns="status" id="21168.6213-69"><status>"Hai, saya menggunakan WhatsApp"</status></iq>
}
},

serializeM: {
/**
* Serialize Message, so it easier to manipulate
* @param {import('@whiskeysockets/baileys').proto.WebMessageInfo} m
*/
value(m) {
return smsg(conn, m)
},
writable: true,
},
user: {
get() {
Object.assign(botUser, conn.authState.creds.me || {})
return {
...botUser,
jid: botUser.id?.decodeJid?.() || botUser.id,
}
},
set(value) {
Object.assign(botUser, value)
},
enumerable: true,
configurable: true,
}
})

return sock
}
/**
* Serialize Message
* @param {ReturnType<typeof makeWASocket>} conn 
* @param {import('@whiskeysockets/baileys').proto.WebMessageInfo} m 
* @param {Boolean} hasParent 
*/
export function smsg(conn, m, hasParent) {
if (!m) return m
/**
* @type {import('@whiskeysockets/baileys').proto.WebMessageInfo}
*/
let M = proto.WebMessageInfo
m = M.fromObject(m)
Object.defineProperty(m, 'conn', { enumerable: false, writable: true, value: conn })
let protocolMessageKey
if (m.message) {
if (m.mtype == 'protocolMessage' && m.msg.key) {
protocolMessageKey = m.msg.key
if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat
if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender
protocolMessageKey.fromMe = areJidsSameUser(protocolMessageKey.participant, conn.user.id)
if (!protocolMessageKey.fromMe && areJidsSameUser(protocolMessageKey.remoteJid, conn.user.id)) protocolMessageKey.remoteJid = m.sender
}
if (m.quoted) if (!m.quoted.mediaMessage) delete m.quoted.download
}
if (!m.mediaMessage) delete m.download

try {
if (protocolMessageKey && m.mtype == 'protocolMessage') conn.ev.emit('messages.delete', { keys: [protocolMessageKey] })
} catch (e) {
console.error(e)
}
return m
}

// https://github.com/Nurutomo/wabot-aq/issues/490
const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage','ptvMessage']
export function serialize() {
return Object.defineProperties(proto.WebMessageInfo.prototype, {
conn: {
value: Connection.conn,
enumerable: false,
writable: true
},
id: {
get() {
return this.key?.id
}
},
isBaileys: {
get() {
return this.id?.length === 16 || this.id?.startsWith('3EB0') && this.id?.length === 12 || false
}
},
chat: {
get() {
const senderKeyDistributionMessage = this.message?.senderKeyDistributionMessage?.groupId
return (
this.key?.remoteJid ||
(senderKeyDistributionMessage &&
senderKeyDistributionMessage !== 'status@broadcast'
) || ''
).decodeJid()
}
},
isGroup: {
get() {
return this.chat.endsWith('@g.us')
},
enumerable: true
},
sender: {
get() {
return this.conn?.decodeJid(this.key?.fromMe && this.conn?.user.id || this.participant || this.key.participant || this.chat || '')
},
enumerable: true
},
fromMe: {
get() {
return this.key?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender) || false
}
},
mtype: {
get() {
if (!this.message) return ''
return getContentType(this.message)
},
enumerable: true
},
msg: {
get() {
if (!this.message) return null
return this.message[this.mtype]
}
},
mediaMessage: {
get() {
if (!this.message) return null
const Message = ((this.msg?.url || this.msg?.directPath) ? { ...this.message } : extractMessageContent(this.message)) || null
if (!Message) return null
const mtype = Object.keys(Message)[0]
return MediaType.includes(mtype) ? Message : null
},
enumerable: true
},
mediaType: {
get() {
let message
if (!(message = this.mediaMessage)) return null
return Object.keys(message)[0]
},
enumerable: true,
},
quoted: {
get() {
/** @type {ReturnType<typeof makeWASocket>} */
const self = this
const msg = self.msg
const contextInfo = msg?.contextInfo
const quoted = contextInfo?.quotedMessage
if (!msg || !contextInfo || !quoted) return null
const type = Object.keys(quoted)[0]
let q = quoted[type]
const text = typeof q === 'string' ? q : q.text
return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? { text: q } : q)), {
mtype: {
get() {
return type
},
enumerable: true
},
mediaMessage: {
get() {
const Message = ((q.url || q.directPath) ? { ...quoted } : extractMessageContent(quoted)) || null
if (!Message) return null
const mtype = Object.keys(Message)[0]
return MediaType.includes(mtype) ? Message : null
},
enumerable: true
},
mediaType: {
get() {
let message
if (!(message = this.mediaMessage)) return null
return Object.keys(message)[0]
},
enumerable: true,
},
id: {
get() {
return contextInfo.stanzaId
},
enumerable: true
},
chat: {
get() {
return contextInfo.remoteJid || self.chat
},
enumerable: true
},
isBaileys: {
get() {
return this.id?.length === 16 || this.id?.startsWith('3EB0') && this.id.length === 12 || false
},
enumerable: true
},
sender: {
get() {
return (contextInfo.participant || this.chat || '').decodeJid()
},
enumerable: true
},
fromMe: {
get() {
return areJidsSameUser(this.sender, self.conn?.user.jid)
},
enumerable: true,
},
text: {
get() {
return text || this.caption || this.contentText || this.selectedDisplayText || ''
},
enumerable: true
},
mentionedJid: {
get() {
return q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || []
},
enumerable: true
},
name: {
get() {
const sender = this.sender
return sender ? self.conn?.getName(sender) : null
},
enumerable: true

},
vM: {
get() {
return proto.WebMessageInfo.fromObject({
key: {
fromMe: this.fromMe,
remoteJid: this.chat,
id: this.id
},
message: quoted,
...(self.isGroup ? { participant: this.sender } : {})
})
}
},
fakeObj: {
get() {
return this.vM
}
},
download: {
value(saveToFile = false) {
const msg = this.message || null
const mtype = msg ? Object.keys(msg)[0] : this.mediaType
return self.conn?.downloadM(msg ? msg[mtype] : this.mediaMessage[mtype], mtype.replace(/message/i, ''), { saveToFile })
},
enumerable: true,
configurable: true,
},
reply: {
/**
* Reply to quoted message
* @param {String|Object} text
* @param {String|false} chatId
* @param {Object} options
*/
value(text, chatId, options = {}) {
return self.conn?.reply(chatId ? chatId : this.chat, text, this.vM, options)
},
enumerable: true,
},
copy: {
/**
* Copy quoted message
*/
value() {
const M = proto.WebMessageInfo
return smsg(conn, M.fromObject(M.toObject(this.vM)))
},
enumerable: true,
},
forward: {
/**
* Forward quoted message
* @param {String} jid
*  @param {Boolean} forceForward
*/
value(jid, force = false, options = {}) {
return self.conn?.sendMessage(jid, {
forward: this.vM, force, ...options
}, options)
},
enumerable: true,
},
copyNForward: {
/**
* Exact Forward quoted message
* @param {String} jid
* @param {Boolean|Number} forceForward
* @param {Object} options
*/
value(jid, forceForward = false, options = {}) {
return self.conn?.copyNForward(jid, this.vM, forceForward, options)
},
enumerable: true,

},
cMod: {
/**
* Modify quoted Message
* @param {String} jid
* @param {String} text
* @param {String} sender
* @param {Object} options
*/
value(jid, text = '', sender = this.sender, options = {}) {
return self.conn?.cMod(jid, this.vM, text, sender, options)
},
enumerable: true,

},
delete: {
/**
* Delete quoted message
*/
value() {
return self.conn?.sendMessage(this.chat, { delete: this.vM.key })
},
enumerable: true,

},
react: {
value(text) {
return self.conn?.sendMessage(this.chat, {
react: {
text,
key: this.vM.key
}
})
},
enumerable: true,
}
})
},
enumerable: true
},
_text: {
value: null,
writable: true,
},
text: {
get() {
const msg = this.msg
const text = (typeof msg === 'string' ? msg : msg?.text) || msg?.caption || msg?.contentText || ''
return typeof this._text === 'string' ? this._text : '' || (typeof text === 'string' ? text : (
text?.selectedDisplayText ||
text?.hydratedTemplate?.hydratedContentText ||
text
)) || ''
},
set(str) {
return this._text = str
},
enumerable: true
},
mentionedJid: {
get() {
return this.msg?.contextInfo?.mentionedJid?.length && this.msg.contextInfo.mentionedJid || []
},
enumerable: true
},
name: {
get() {
return !nullish(this.pushName) && this.pushName || this.conn?.getName(this.sender)
},
enumerable: true
},
download: {
value(saveToFile = false) {
const msg = this.message || null
const mtype = msg ? Object.keys(msg)[0] : this.mediaType
return this.conn?.downloadM(msg ? msg[mtype] : this.mediaMessage[mtype], mtype.replace(/message/i, ''), { saveToFile })
},
enumerable: true,
configurable: true
},
reply: {
value(text, chatId, options = {}) {
return this.conn?.reply(chatId ? chatId : this.chat, text, this, options)
}
},
delay: {
           async value (ms) {
                return new Promise((resolve, reject) => setTimeout(resolve, ms)
     ) }
           },
copy: {
value() {
const M = proto.WebMessageInfo
return smsg(this.conn, M.fromObject(M.toObject(this)))
},
enumerable: true
},
forward: {
value(jid, force = false, options = {}) {
return this.conn?.sendMessage(jid, {
forward: this, force, ...options
}, options)
},
enumerable: true
},
copyNForward: {
value(jid, forceForward = false, options = {}) {
return this.conn?.copyNForward(jid, this, forceForward, options)
},
enumerable: true
},
cMod: {
value(jid, text = '', sender = this.sender, options = {}) {
return this.conn?.cMod(jid, this, text, sender, options)
},
enumerable: true
},
getQuotedObj: {
value() {
if (!this.quoted.id) return null
const q = proto.WebMessageInfo.fromObject(this.conn?.loadMessage(this.quoted.sender, this.quoted.id) || this.conn?.loadMessage(this.quoted.id) || this.quoted.vM)
return smsg(this.conn, q)
},
enumerable: true
},
getQuotedMessage: {
get() {
return this.getQuotedObj
}
},
delete: {
value() {
return this.conn?.sendMessage(this.chat, { delete: this.key })
},
enumerable: true
},
react: {
value(text) {
return this.conn?.sendMessage(this.chat, {
react: {
text,
key: this.key
}
})
},
enumerable: true
}
})
}

export function logic(check, inp, out) {
if (inp.length !== out.length) throw new Error('Input and Output must have same length')
for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i]
return null
}

export function protoType() {
/**
* @returns {ArrayBuffer}
*/
Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
const ab = new ArrayBuffer(this.length)
const view = new Uint8Array(ab)
for (let i = 0; i < this.length; ++i) {
view[i] = this[i]
}
return ab;
}
/**
* @returns {ArrayBuffer}
*/
Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength)
}
/**
* @returns {Buffer}
*/
ArrayBuffer.prototype.toBuffer = function toBuffer() {
const buf = Buffer.alloc(this.byteLength)
const view = new Uint8Array(this)
for (let i = 0; i < buf.length; ++i) {
buf[i] = view[i]
}
return buf;
}

/**
* @returns {Promise<import('file-type').FileTypeResult | undefined>}
*/
Uint8Array.prototype.getFileType =
ArrayBuffer.prototype.getFileType =
Buffer.prototype.getFileType = function getFileType() {
return fileTypeFromBuffer(this)
}
/**
* @returns {Boolean}
*/
String.prototype.isNumber =
Number.prototype.isNumber = function isNumber() {
const int = parseInt(this)
return typeof int === 'number' && !isNaN(int)
}
/**
* @returns {String}
*/
String.prototype.capitalize = function capitalize() {
return this.charAt(0).toUpperCase() + this.slice(1, this.length)
}
/**
* @returns {String}
*/
String.prototype.capitalizeV2 = function capitalizeV2() {
const str = this.split(' ')
return str.map(v => v.capitalize()).join(' ')
}
/**
* @returns {String}
*/
String.prototype.decodeJid = function decodeJid() {
if (/:\d+@/gi.test(this)) {
const decode = jidDecode(this) || {}
return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim()
} else return this.trim()
}
/**
* Number must be milliseconds
* @returns {string}
*/
Number.prototype.toTimeString = function toTimeString() {
// const milliseconds = this % 1000
const seconds = Math.floor((this / 1000) % 60)
const minutes = Math.floor((this / (60 * 1000)) % 60)
const hours = Math.floor((this / (60 * 60 * 1000)) % 24)
const days = Math.floor((this / (24 * 60 * 60 * 1000)))
return (
(days ? `${days} day(s) ` : '') +
(hours ? `${hours} hour(s) ` : '') +
(minutes ? `${minutes} minute(s) ` : '') +
(seconds ? `${seconds} second(s)` : '')
).trim()
}
Number.prototype.getRandom =
String.prototype.getRandom =
Array.prototype.getRandom = function getRandom() {
if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)]
return Math.floor(Math.random() * this)
}

}

/**
* ??
* @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
* @returns {boolean}
*/
function nullish(args) {
return !(args !== null && args !== undefined)
}