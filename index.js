/**
  * CODE FROM CLICKNETCAFE *
  * MODIFER BY ALDI *
  * Don't delete the watermark if you want to change it, it's better to add it *
  * All I did was change this code a little and adapt it, this is the initial base bot script without features, please add as you wish, don't forget to include the credits above
*/
import './config.js';
import Helper from './lib/helper.js'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import { createInterface } from 'readline'
import chalk from 'chalk';

const rl = createInterface(process.stdin, process.stdout)
const __dirname = dirname(fileURLToPath(import.meta.url))
const args = [join(__dirname, 'main.js'), ...process.argv.slice(2)]

var isRunning = false
/**
 * Start a js file
 * @param {String} file `path/to/file`
 */
 
function start(file) {
	if (isRunning) return
	isRunning = true
	setupMaster({
		exec: args[0],
		args: args.slice(1),
	})
	let p = fork()
	p.on('message', data => {
		console.log('[RECEIVED]', data)
		switch (data) {
			case 'reset':
				p.process.kill()
				isRunning = false
				start.apply(this, arguments)
				break
			case 'uptime':
				p.send(process.uptime())
				break
		}
	})
	p.on('exit', (_, code) => {
		isRunning = false
		console.error('Exited with code:', code)
		if (code === 0) return
		watchFile(args[0], () => {
			unwatchFile(args[0])
			start(file)
		})
	})
	if (!Helper.opts['test'])
		if (!rl.listenerCount()) rl.on('line', line => {
			p.emit('message', line.trim())
		})
}

start('main.js')