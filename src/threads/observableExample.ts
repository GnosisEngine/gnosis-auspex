// @OTOD copy this file to a desired folder and name it *Worker.ts
import { Observable, Subject } from 'threads/observable'
import { expose } from 'threads/worker'

let max = -Infinity
let min = Infinity

let subject = new Subject()

const minmax = {
  values() {
    return Observable.from(subject)
  },
  add(value) {
    max = Math.max(max, value)
    min = Math.min(min, value)
    subject.next({ max, min })
  },
  finish() {
    subject.complete()
    subject = new Subject()
  },
  error (e) {
    subject.error(e)
  }
}

expose(minmax)
