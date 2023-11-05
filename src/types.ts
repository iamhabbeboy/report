export interface IReport {
    id: number;
    date: number;
    service: string;
    offering: string;
    main: Attendance;
    overflow: Attendance;
    extension: Attendance;
    teens: ChildrenAttendance;
    children: ChildrenAttendance;
    other: OtherAttendance;
  }

export interface OtherAttendance {
    [key:string]: number; // traffic and info desk
}
  
export interface Attendance {
    adult: number;
    baby: number;
  }
  
export interface ChildrenAttendance extends Pick<Attendance, 'adult'>{
    children: number;
  }