import fs from 'fs'
import { promises } from 'fs'
import path from 'path'
import fastFolderSize from 'fast-folder-size'
import { promisify } from 'util'
import { exec } from 'child_process'
import iconv from 'iconv-lite'

const fastFolderSizeAsync = promisify(fastFolderSize)
const execAsync = promisify(exec)

const excludeFiles = ['$RECYCLE.BIN', 'System Volume Information']
const MB = 1024 ** 2
const Size = 800 * MB
const src = process.argv[2]

async function readDir() {
  let arr = []

  async function read(s: string) {
    console.log('read s', s)
    let result = await promises.readdir(s)
    console.log('read 1111111')

    await Promise.all(
      result.map(async (e) => {
        // console.log('dick 1')
        if (excludeFiles.includes(e)) return
        const path_string = path.resolve(s, e)
        // console.log('dick 2')

        if ((await promises.lstat(path_string)).isDirectory()) {
          // console.log('dick 2 if')
          if (greatThan(await fastFolderSizeAsync(path_string)))
            read(path_string)
        } else {
          // console.log('dick 2 else')
          if (greatThan((await promises.stat(path_string)).size)) {
            // console.log('fuck e', e)
            let ak = await ab(`certutil -hashfile "${path_string}" MD5`)
            arr.push(ak)
          }
        }

        // console.log('dick 3')
      })
    )
    console.log('read end')
  }
  await read(src)
  console.log('readDir end')
  return arr
}

;(async () => {
  let cc = await readDir()
  // console.log('end')
  console.log(cc)
})()

function ab(s: string) {
  const encoding = 'cp936'
  const binaryEncoding = 'binary'

  function iconvDecode(str = '') {
    return iconv.decode(Buffer.from(str, binaryEncoding), encoding)
  }

  const { exec } = require('child_process')

  return new Promise((resolve, reject) => {
    exec(s, { encoding: 'binary' }, (err, stdout, stderr) => {
      let result = iconvDecode(stdout)
      result = result.split('\r\n')[1]
      resolve(result)
    })
  })
}

function greatThan(n: number) {
  return n > Size
}
