import { spawn, Pool, Worker } from "threads"

// @TODO change name of ThisPool
export const ThisPool = async () => {
  // @TODO change the worker path
  const pool = Pool(() => spawn(new Worker("./workerExample")), {
    concurrency: 1, // number of tasks to run simultaneously per worker, defaults to one
    maxQueuedJobs: Infinity, // maximum number of tasks to queue before throwing on .queue(), defaults to unlimited
    name: 'thisPool', // give the pool a custom name to use in the debug log, so you can tell multiple pools apart when debugging
    size: 4 // number of workers to spawn, defaults to the number of CPU cores
  })

  // You might rather want to pool.queue().then() to defer handling the outcome and keep queueing tasks uninterruptedly.

  const task = pool.queue(async worker => {
    // @TODO do work
    const result = await worker(2, 3)
  })

  // task.cancel() can be called.  tasks can also be pushed to a tasks array and then called via await Promise.all(tasks) to wait until all tasks complete

  await pool.completed()
  await pool.terminate()
}
