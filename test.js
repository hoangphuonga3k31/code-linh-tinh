let cur = new Date();
let startTime = null;
let endTime = null;
switch (dateRange) {
    case '1': // Hôm nay
        startTime = new Date(cur);
        startTime.setHours(0, 0, 0);
        endTime = new Date(cur);
        endTime.setHours(23, 59, 59);
        break;
    case '2': // Hôm qua
        startTime = new Date(cur);
        startTime.setDate(cur.getDate() - 1);
        startTime.setHours(0, 0, 0);
        endTime = new Date(cur);
        endTime.setDate(cur.getDate() - 1);
        endTime.setHours(23, 59, 59);
        break;
    case '3': // Tuần này
        let first = cur.getDate() - cur.getDay();
        let last = first + 6;
        startTime = new Date(cur.setDate(first));
        startTime.setHours(0, 0, 0);
        endTime = new Date(cur.setDate(last));
        endTime.setHours(23, 59, 59);
        break;
    case '4': // Tuần trước
        let firstDayOfCurrentWeek = new Date(cur.getTime());
        firstDayOfCurrentWeek.setDate(cur.getDate() - cur.getDay());
        startTime = new Date(firstDayOfCurrentWeek.getTime());
        startTime.setDate(firstDayOfCurrentWeek.getDate() - 7);
        startTime.setHours(0, 0, 0);
        endTime = new Date(startTime.getTime());
        endTime.setDate(endTime.getDate() + 6);
        endTime.setHours(23, 59, 59);
        break;
    case '5': // Tháng này
        startTime = new Date(cur.getFullYear(), cur.getMonth(), 1);
        startTime.setHours(0, 0, 0);
        endTime = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
        endTime.setHours(23, 59, 59);
        break;
    case '6': // Tháng trước
        startTime = new Date(cur.getFullYear(), cur.getMonth() - 1, 1);
        startTime.setHours(0, 0, 0);
        endTime = new Date(cur.getFullYear(), cur.getMonth(), 0);
        endTime.setHours(23, 59, 59);
        break;
    case '7': // Quý này
        let curQuarter = Math.floor((cur.getMonth() / 3));
        startTime = new Date(cur.getFullYear(), curQuarter * 3, 1);
        startTime.setHours(0, 0, 0);
        endTime = new Date(cur.getFullYear(), (curQuarter * 3) + 3, 0);
        endTime.setHours(23, 59, 59);
        break;
    case '8': // Quý trước
        let lastQuarter = Math.floor((cur.getMonth() / 3)) - 1;
        startTime = new Date(cur.getFullYear(), lastQuarter * 3, 1);
        startTime.setHours(0, 0, 0);
        endTime = new Date(cur.getFullYear(), (lastQuarter * 3) + 3, 0);
        endTime.setHours(23, 59, 59);
        break;
    case '9': // Tùy chọn
        startTime = fromDate ? fromDate : new Date(cur);
        startTime.setHours(0, 0, 0);
        endTime = toDate ? toDate : new Date(cur);
        endTime.setHours(23, 59, 59);
        break;
    default:
        startTime = new Date(cur);
        startTime.setHours(0, 0, 0);
        endTime = new Date(cur);
        endTime.setHours(23, 59, 59);
        break;
}
let data = me.GetDataPaint({
    FromDate: startTime /* DATETIME */,
    ToDate: endTime /* DATETIME */,
    Type: undefined /* STRING */,
    REPORT: 'R007' /* STRING */
});

let val = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Manual.CTARPT_007"
});
result = data;
me.ReturnDataReportCTARPT007({
    ToDate: endTime /* DATETIME */,
    FromDate: startTime /* DATETIME */
});