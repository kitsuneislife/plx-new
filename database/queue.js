class DatabaseQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  addTask(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessing = false;
  }
}

module.exports = DatabaseQueue;
