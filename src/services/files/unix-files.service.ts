import { exec } from 'child_process';

import { FileService } from './files.service.js';
import { IListDirParams } from '../../interfaces/index.js';
import { BehaviorSubject, Observable } from 'rxjs';
import { StreamService } from '../stream.service.js';
import { FileWorkerService } from './files.worker.service.js';

export abstract class UnixFilesService extends FileService {
  constructor(
    protected streamService: StreamService,
    protected fileWorkerService: FileWorkerService,
  ) {
    super();
  }

  abstract getFolderSize(path: string): Observable<any>;

  listDir(params: IListDirParams): Observable<string> {
    const stream$ = new BehaviorSubject(null);
    this.fileWorkerService.startScan(stream$, params);
    return stream$;
  }

  deleteDir(path: string): Promise<{}> {
    return new Promise((resolve, reject) => {
      const command = `rm -rf "${path}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) return reject(stderr);
        resolve(stdout);
      });
    });
  }

  protected prepareFindArgs(params: IListDirParams): string[] {
    throw new Error('Method not implemented.');
    const { path, targets, exclude } = params;
    // TODO: change this
    const currentTarget = targets[0];
    const target = currentTarget;
    let args: string[] = [path];

    if (exclude) {
      args = [...args, this.prepareExcludeArgs(exclude)].flat();
    }
    let additionalArgs = [];
    if (currentTarget.siblingFile) {
      additionalArgs = ['-execdir', 'test -e "nativescript.config.ts" \\;'];
    }
    additionalArgs = ['-execdir', 'test -e "nativescript.config.ts" \\;'];

    args = [...args, '-name', target, ...additionalArgs, '-prune'];

    return args;
  }

  protected prepareExcludeArgs(exclude: string[]): string[] {
    throw new Error('Method not implemented.');
    const excludeDirs = exclude.map((dir: string) => [
      '-not',
      '(',
      '-name',
      dir,
      '-prune',
      ')',
    ]);
    return excludeDirs.flat();
  }
}
