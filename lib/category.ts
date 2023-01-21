// import fastFolderSizeSync from 'fast-folder-size/sync'
// import fs from 'fs'
// import path from 'path'
// import readline from 'readline'

// import * as cons from './cons'

// const SIZE = 500 * 1024 ** 2

// const target = 'g:'

// const config = {
//   needRename: false,

//   info_file: '_allStars.json',
// }

// const onlyRoot = /[e-z]:[\\/]?$/i
// const isVdo = /[e-z]:[\\/]vdo[\\/]?$/i
// const starPattern = /(?:\d{2}\.)([a-z]*(?:\.| )[a-z]*)/i
// const unknown = 'unknown'

// const systemFiles = ['$RECYCLE.BIN', 'System Volume Information']

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// })
// process.on('exit', () => {
//   rl.close()
// })

// class Category {
//   allFiles: string[]
//   isCapture: boolean
//   starAbs: Map<string, [string, string][]>
//   src: string

//   constructor(src: string) {
//     this.src = src
//     this.allFiles = []
//     this.isCapture = true
//     this.starAbs = new Map()
//     this.starAbs.set(unknown, [])

//     console.log()
//     this.init()
//   }

//   init() {
//     if (isVdo.test(this.src)) {
//       this.readVdo()
//     } else {
//       this.read()
//     }
//   }

//   readVdo() {}

//   async read() {
//     this.src = this.src.charAt(0).toUpperCase() + this.src.slice(1)

//     if (onlyRoot.test(this.src)) {
//       let s = await inquier('needRename type `yes` ')
//       if (s === 'yes') {
//         config.needRename = true
//       }

//       this.readRoot()
//     } else {
//       this.readDir()
//     }
//   }

//   async readRoot() {
//     if ((await inquier('no need capture type `no` ')) === 'no') {
//       this.isCapture = false
//     }

//     const excludeFiles = new Set(cons.excludeFiles[this.src[0]])
//     let output = path.resolve(this.src, 'vdo')
//     excludeFiles.add(output)

//     if (fs.existsSync(output)) {
//       console.log(output, 'exist')
//       config.needRename = false
//     } else {
//       console.log('mkdirSync', output)
//       fs.mkdirSync(output)
//     }

//     let firstDirs = fs.readdirSync(this.src)

//     firstDirs = firstDirs
//       .filter((e) => !systemFiles.includes(e))
//       .map((e) => path.resolve(this.src, e))
//       .filter((e) => {
//         if (excludeFiles.has(e)) {
//           excludeFiles.delete(e)
//         } else return true
//       })

//     if (excludeFiles.size !== 0) {
//       console.log([...excludeFiles])
//       firstDirs.forEach((e) => {
//         scan(e)
//       })
//     } else {
//       firstDirs.forEach((e) => {
//         readDir(e)
//       })
//     }

//     function scan(route: string) {
//       let result = fs.readdirSync(route)

//       result.forEach((filename) => {
//         const path_string = path.resolve(route, filename)

//         if (fs.lstatSync(path_string).isDirectory()) {
//           if (excludeFiles.has(path_string)) {
//             excludeFiles.delete(path_string)
//             return
//           }
//           if (greatThan(fastFolderSizeSync(path_string))) scan(path_string)
//         } else if (greatThan(fs.statSync(path_string).size)) {
//           this.generateData(filename, path_string)
//         }
//       })
//     }

//     console.log()
//   }

//   generateData(filename: string, path_string: string) {
//     console.log()
//   }
// }

// function write(root: string, allFiles: any[]) {
//   const allStars = `${root.charAt(0)}${config.info_file}`
//   fs.writeFileSync(allStars, JSON.stringify(allFiles, null, 4))
//   return allStars
// }

// function greatThan(n: number) {
//   return n > SIZE
// }

// function inquier(hint) {
//   return new Promise((resolve) => {
//     rl.question(hint, (s) => {
//       resolve(s)
//     })
//   })
// }
