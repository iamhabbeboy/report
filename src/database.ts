import Dexie, { Table } from "dexie";
import { IReport } from "./types";

export class ReportDatabase extends Dexie {
    reports!: Table<IReport>; 
  
    constructor() {
      super('tcn_report');
      this.version(1).stores({
        reports: '++id' // Primary key and indexed props
      });
    }
  }
  
  export const db = new ReportDatabase();