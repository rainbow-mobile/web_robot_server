"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtil = void 0;
const date_fns_1 = require("date-fns");
class DateUtil {
    static formatDateYYYYMMbDDsHHcMIcSS(date) {
        return (0, date_fns_1.format)(date, 'yyyy-MM-dd HH:mm:ss');
    }
    static formatDateYYYYMMbDDsHHcMIcSSZZZ(date) {
        return (0, date_fns_1.format)(date, 'yyyy-MM-dd HH:mm:ss.SSS');
    }
    static formatDateYYYYMMDD(date) {
        return (0, date_fns_1.format)(date, 'yyyy-MM-dd');
    }
    static formatDaysAgo(date, daysago) {
        const newDate = new Date();
        newDate.setDate(date.getDate() - daysago);
        newDate.setHours(23, 59, 59, 999);
        return newDate;
    }
}
exports.DateUtil = DateUtil;
//# sourceMappingURL=date.util.js.map