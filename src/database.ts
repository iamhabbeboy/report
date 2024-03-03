import Dexie, { Table } from "dexie";
import { IChildren, IReport } from "./types";

export class ReportDatabase extends Dexie {
    reports!: Table<IReport>; 
    children!: Table<IChildren>; 
  
    constructor() {
      super('tcn_report');
      this.version(1).stores({
        reports: '++id', // Primary key and indexed props
        children: 'age, name',
      });
    }
  }
  
  export const db = new ReportDatabase();