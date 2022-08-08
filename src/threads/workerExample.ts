// @OTOD copy this file to a desired folder and name it *Worker.ts
import { expose } from 'threads/worker'

// @TODO Organize worker code here
const worker = {}

// @TODO change the name of ThisWorker to the name of the worker
export type ThisWorker = typeof worker

expose(worker)
