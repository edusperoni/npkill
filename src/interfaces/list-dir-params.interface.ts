export interface IListDirParams {
  path: string;
  exclude?: string[];
  targets: {
    target: string;
    siblingFile?: string;
  }[];
}
