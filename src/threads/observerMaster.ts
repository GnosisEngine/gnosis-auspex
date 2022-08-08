// @TODO copy this file to the desired folder and name it *Master.ts
import { spawn, Thread, Worker } from 'threads'

// @TODO change name of ThisMaster
export const ThisMaster = async () => {
  // @TODO change the worker path
  const minmax = await spawn(new Worker('./observableExample'))

  // Subscribe to fire a callback when the Observable subject's .next() is called
  minmax.values().subscribe(({ min, max }) => {
    console.log(`Min: ${min} | Max: ${max}`)
  })

  const result = []
  // @TODO do worker.*() method calls here the way you need to and accumulate a result

  await Thread.terminate(minmax)
  return result
}
