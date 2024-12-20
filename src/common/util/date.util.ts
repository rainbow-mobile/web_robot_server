import { format } from 'date-fns';
export class DateUtil {
  static formatDateYYYYbMMbDDsHHcMIcSS(date: Date): string {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  }
}
