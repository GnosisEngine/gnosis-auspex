// @TODO copy this file to the desired folder and name it *Master.ts
import type { ThisWorker } from './workerExample'
import { spawn, Thread, Worker } from 'threads'

// @TODO change name of ThisMaster
export const ThisMaster = async () => {
  // @TODO change the worker path
  const worker = await spawn<ThisWorker>(new Worker('./workerExample'))
  const result = []
  // @TODO do worker.*() method calls here the way you need to and accumulate a result
  
  await Thread.terminate(worker)
  return result
}
