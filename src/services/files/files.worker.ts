'use strict';

import { Dirent, opendir, existsSync } from 'fs';

import EventEmitter from 'events';
import { memoryUsage } from 'process';
import { parentPort } from 'worker_threads';
import { IListDirParams } from '../../interfaces';
import { dirname, join } from 'path';

function hasSibling(path: string, sibling?: string) {
  if (!sibling) {
    return true;
  }
  return existsSync(join(dirname(path), sibling));
}

enum ETaskOperation {
  'explore',
  'getSize',
}
interface Task {
  operation: ETaskOperation;
  path: string;
}

(() => {
  parentPort.on('message', (data) => {
    if (data?.type === 'start-explore') {
      startExplore(data.value);
    }

    if (data?.type === 'start-getSize') {
      // startGetSize(data.value.path, data.value.id);
      parentPort.postMessage({
        type: 'getsize-job-completed-' + data.value.id,
        value: -1,
      });
    }
  });

  function startExplore({ path, targets }: IListDirParams) {
    const fileWalker = new FileWalker();
    fileWalker.enqueueTask(path);

    fileWalker.onNewResult(({ path, dirent }) => {
      if (dirent.isDirectory()) {
        const subpath = (path === '/' ? '' : path) + '/' + dirent.name;

        if (
          targets.some(
            ({ target, siblingFile }) =>
              dirent.name === target && hasSibling(subpath, siblingFile),
          )
        ) {
          parentPort.postMessage({ type: 'scan-result', value: subpath });
        } else {
          fileWalker.enqueueTask(subpath);
        }
      }
    });

    fileWalker.onQueueEmpty(() => {
      parentPort.postMessage({ type: 'scan-job-completed' });
    });
  }

  // Unnused for now because 'du' is much faster.
  //
  // function startGetSize(path: string, id: number) {
  //   const fileWalker = new FileWalker();
  //   let size = 0;
  //   let allFilesScanned = false;
  //   let getSizeInProgress = false;
  //   fileWalker.enqueueTask(path);

  //   const sendResult = () => {
  //     parentPort.postMessage({
  //       type: 'getsize-job-completed-' + id,
  //       value: size,
  //     });
  //   };

  //   const getSize = async (path: string) => {
  //     getSizeInProgress = true;
  //     size += (await stat(path)).size;
  //     getSizeInProgress = false;
  //     if (allFilesScanned) {
  //       sendResult();
  //     }
  //   };

  //   fileWalker.onNewResult(({ path, dirent }) => {
  //     const subpath = (path === '/' ? '' : path) + '/' + dirent.name;
  //     if (dirent.isDirectory()) {
  //       fileWalker.enqueueTask(subpath);
  //     } else if (dirent.isFile()) {
  //       getSize(subpath);
  //     }
  //   });

  //   fileWalker.onQueueEmpty(() => {
  //     allFilesScanned = true;
  //     if (!getSizeInProgress) {
  //       sendResult();
  //     }
  //   });
  // }
})();

class FileWalker {
  readonly events = new EventEmitter();

  private taskQueue: Task[] = [];
  private procs = 0;
  // More PROCS improve the speed of the search, but increment
  // but it will greatly increase the maximum ram usage.
  private readonly MAX_PROCS = 100;
  private VERBOSE = false;

  constructor() {}

  onQueueEmpty(fn: () => void) {
    this.events.on('onCompleted', () => fn());
  }

  onNewResult(fn: (result: { path: string; dirent: Dirent }) => void) {
    this.events.on('onResult', (result) => fn(result));
  }

  enqueueTask(path: string) {
    this.taskQueue.push({ path, operation: ETaskOperation.explore });
    this.processQueue();
  }

  private run(path: string) {
    this.updateProcs(1);

    opendir(path, async (err, dir) => {
      if (err) {
        this.updateProcs(-1);
        this.processQueue();
        return;
      }

      let entry: Dirent | null = null;
      while ((entry = await dir.read().catch(() => null)) != null) {
        this.onResult(path, entry);
      }

      await dir.close();
      this.updateProcs(-1);
      this.processQueue();

      if (this.taskQueue.length === 0 && this.procs === 0) {
        this.onCompleted();
      }
    });
  }

  private updateProcs(value: number) {
    this.procs += value;

    if (this.VERBOSE) {
      this.events.emit('stats', {
        type: 'proc',
        value: { procs: this.procs, mem: memoryUsage() },
      });
    }
  }

  private processQueue() {
    while (this.procs < this.MAX_PROCS && this.taskQueue.length > 0) {
      const path = this.taskQueue.shift().path;
      this.run(path);
    }
  }

  private onResult(path: string, dirent: Dirent) {
    this.events.emit('onResult', { path, dirent });
  }

  private onCompleted() {
    this.events.emit('onCompleted');
  }
}
