import fastFolderSizeSync from 'fast-folder-size/sync'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

import * as cons from '../sens/cons'

const SIZE = 500 * 1024 ** 2

// const target = 'H:\\vdo'

const config = {
  needRename: false,
  isCapture: true,
  info_file: '_allStars.json',
}

const onlyRoot = /[e-z]:[\\/]?$/i
const isVdo = /[e-z]:[\\/]vdo[\\/]?$/i

const systemFiles = ['$RECYCLE.BIN', 'System Volume Information']
let rl

function init(src: string) {
  if (isVdo.test(src)) {
    readVdo(src)
  } else {
    read(src)
  }
}

function inquier(hint) {
  return new Promise((resolve) => {
    rl.question(hint, (s) => {
      resolve(s)
    })
  })
}

export function readVdo(src: string) {
  let result = fs.readdirSync(src)

  let allFiles = []
  result.forEach((e) => {
    e = path.resolve(src, e)
    allFiles.push(...fs.readdirSync(e))
  })

  write(src, allFiles)
}

function read(src: string) {
  let allFiles = []
  let starPattern = /(?:\d{2}\.)([a-z]*(?:\.| )[a-z]*)/i

  let starAbs: Map<string, [string, string][]> = new Map()
  let unknown = 'unknown'
  starAbs.set(unknown, [])

  if (onlyRoot.test(src)) {
    src = cap(src)
    readRoot(src)
  } else {
    readDir(src)
  }

  function generateArr(filename: string, path_string: string) {
    if (allFiles.includes(filename)) {
      console.log('exist', path_string)
    } else {
      allFiles.push(filename)
    }
  }

  function generateStars(filename: string, path_string: string) {
    let starInfo = starPattern.exec(filename)
    if (!starInfo) {
      console.log('not match', filename)
      starAbs.get(unknown).push([filename, path_string])
    } else {
      let star = starInfo[1]
      if (star[star.length - 1] === '.') star = star.slice(0, star.length - 1)
      if (star.includes(' ')) star = star.replace(' ', '.')

      if (!starAbs.has(star)) {
        starAbs.set(star, [[filename, path_string]])
      } else {
        starAbs.get(star).push([filename, path_string])
      }
    }
  }

  function readDir(route: string) {
    let result = fs.readdirSync(route)

    result.forEach((filename) => {
      const path_string = path.resolve(route, filename)

      if (fs.lstatSync(path_string).isDirectory()) {
        if (greatThan(fastFolderSizeSync(path_string))) readDir(path_string)
      } else if (greatThan(fs.statSync(path_string).size)) {
        generateArr(filename, path_string)
      }
    })
  }

  async function readRoot(root: string) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    if ((await inquier('no need capture type `no` ')) === 'no') {
      config.isCapture = false

      if ((await inquier('needRename type `yes` ')) === 'yes') {
        config.needRename = true
      }
    }

    rl.close()

    const excludeFiles = new Set(cons.excludeFiles[root[0]])
    let output = path.resolve(root, 'vdo')
    excludeFiles.add(output)

    if (fs.existsSync(output)) {
      console.log(output, 'exist')
      config.needRename = false
    } else {
      console.log('mkdirSync', output)
      fs.mkdirSync(output)
    }

    let firstDirs = fs.readdirSync(root)

    firstDirs = firstDirs
      .filter((e) => !systemFiles.includes(e))
      .map((e) => path.resolve(root, e))
      .filter((e) => {
        if (excludeFiles.has(e)) {
          excludeFiles.delete(e)
        } else return true
      })

    let generate = config.isCapture ? generateArr : generateStars
    firstDirs.forEach((e) => {
      scan(e, generate)
    })

    function scan(route: string, generate) {
      let result = fs.readdirSync(route)

      result.forEach((filename) => {
        const path_string = path.resolve(route, filename)

        if (fs.lstatSync(path_string).isDirectory()) {
          if (excludeFiles.has(path_string)) {
            excludeFiles.delete(path_string)
            return
          }
          if (greatThan(fastFolderSizeSync(path_string)))
            scan(path_string, generate)
        } else if (greatThan(fs.statSync(path_string).size)) {
          generate(filename, path_string)
        }
      })
    }

    const allStars = write(root, allFiles)

    console.log('before rename, you need read', allStars)

    if (config.needRename) {
      console.log('needRename start')
      starAbs.forEach((files, star) => {
        let directory = path.resolve(output, star)
        if (!fs.existsSync(directory)) fs.mkdirSync(directory)
        files.forEach(([filename, abs_path]) =>
          fs.renameSync(abs_path, path.resolve(directory, filename))
        )
      })
    } else {
      console.log('no needRename')
    }
  }
}

export function cap(src: string) {
  src = src.charAt(0).toUpperCase() + src.slice(1)
  return src
}

function write(root: string, allFiles: any[]) {
  const allStars = `${root.charAt(0)}${config.info_file}`
  fs.writeFileSync(allStars, JSON.stringify(allFiles, null, 4))
  return allStars
}

function greatThan(n: number) {
  return n > SIZE
}
