import { dirname, extname } from 'path';

import { BehaviorSubject } from 'rxjs';
import { IListDirParams } from '../../interfaces/index.js';
import { Worker } from 'worker_threads';

export class FileWorkerService {
  private scanWorker = new Worker(this.getWorkerPath());
  private getSizeWorker = new Worker(this.getWorkerPath());

  startScan(stream$: BehaviorSubject<string>, params: IListDirParams) {
    this.scanWorker.postMessage({
      type: 'start-explore',
      value: params,
    });

    this.scanWorker.on('message', (data) => {
      if (data?.type === 'scan-result') {
        stream$.next(data.value);
      }

      if (data?.type === 'scan-job-completed') {
        stream$.complete();
      }
    });

    this.scanWorker.on('error', (error) => {
      this.scanWorker.terminate();
      throw error;
    });

    this.scanWorker.on('exit', (code) => {
      if (code !== 0) {
        this.scanWorker.terminate();
        return;
      }
    });

    return this.scanWorker;
  }

  getSize(stream$: BehaviorSubject<string>, path: string) {
    const id = Math.random();
    this.getSizeWorker.postMessage({
      type: 'start-getSize',
      value: { path, id },
    });

    this.getSizeWorker.on('message', (data) => {
      if (data?.type === 'getsize-job-completed-' + id) {
        stream$.next(data.value);
        stream$.complete();
      }
    });
  }

  private getWorkerPath(): URL {
    const actualFilePath = import.meta.url;
    const dirPath = dirname(actualFilePath);
    // Extension = .ts if is not transpiled.
    // Extension = .js if is a build
    const extension = extname(actualFilePath);
    const workerName = 'files.worker';

    return new URL(`${dirPath}/${workerName}${extension}`);
  }
}
