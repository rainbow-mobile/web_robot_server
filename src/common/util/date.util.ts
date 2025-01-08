import { format } from 'date-fns';
export class DateUtil {
  static formatDateYYYYMMbDDsHHcMIcSS(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  }
  static formatDateYYYYMMbDDsHHcMIcSSZZZ(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss.SSS');
  }
  static formatDateYYYYMMDD(date:Date):string{
    return format(date, 'yyyy-MM-dd');
  }
  static formatDaysAgo(date:Date, daysago:number){
    const newDate = new Date();
    newDate.setDate(date.getDate()-daysago);
    newDate.setHours(23,59,59,999);
    return newDate;
  }
}
