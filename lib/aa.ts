import { cap, readVdo } from '../src/category'

const target = 'H:\\vdo'

let roots = 'eh'
let start = roots[0]
let end = roots[1]
let arr: string[] = []
for (let i = start; i <= end; ) {
  // cap('fuck')
  arr.push(cap(`${i}:\\vdo`))
  i = String.fromCharCode(i.charCodeAt(0) + 1)
}

console.log(arr)

arr.forEach((e) => {
  readVdo(e)
})
