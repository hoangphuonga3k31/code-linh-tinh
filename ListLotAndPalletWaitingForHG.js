//khai báo các hàm
function containsStringIgnoringCaseAndUTF8(mainString, searchString) {
    // Function to remove diacritics from a string
    function removeDiacritics(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Convert both strings to lowercase and remove diacritics
    const normalizedMainString = removeDiacritics(mainString.toLowerCase());
    const normalizedSearchString = removeDiacritics(searchString.toLowerCase());

    // Check if the main string contains the search string
    return normalizedMainString.indexOf(normalizedSearchString) !== -1;
}

////////////////////////////////////////////////////////////////////////////////////
//khai báo các biến dùng chung
let HGProductionData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER_DETAIL",
});
let DataToShow = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Manual.PRODUCTION_MASTER_DETAIL_FOR_WAITING_HG",
});

// CreateInfoTableFromDataShape(infoTableName:STRING("InfoTable"), dataShapeName:STRING):INFOTABLE(AES.DataShape.Manual.PRODUCTION_MASTER_DETAIL_FOR_WAITING_HG)
let filteredData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Manual.PRODUCTION_MASTER_DETAIL_FOR_WAITING_HG",
});

let currentTime = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].GetdateTime();


let queryString = "SELECT * FROM ( select distinct " +
    "PMD.PALLET_ID as PALLET_ID, " +
    "PMD.STATUS as STATUS, " +
    "case " +
    "when PMD.STATUS = '110' and PMD.STAGE_TYPE = 'DE' then N'Chờ' " +
    "when PMD.STATUS = '110' and PMD.STAGE_TYPE = 'HG' then N'Đã phát hành' " +
    "when PMD.STATUS = '117' and PMD.STAGE_TYPE = 'DE' then N'Chờ hóa già lại' " +
    "end as STATUS_STRING, " +
    "PMD.WORK_ORDER_ID as WORK_ORDER_ID, " +
    "PMD.PRODUCT_LOT_NUMBER as PRODUCT_LOT_NUMBER, " +
    "PMD.TOTAL_ALUMINUM_BAR as TOTAL_ALUMINUM_BAR, " +
    "PMD.START_TIME as START_TIME, " +
    "PMD.PR_KEY as PR_KEY, " +
    "PMD.WORK_LINE_ID as WORK_LINE_ID, " +
    "PMD.STAGE_TYPE as STAGE_TYPE, " +
    "PMD.WORK_SHIFT_ID as WORK_SHIFT_ID, " +
    "PMD.ALUMINUM_BAR_LENGTH as ALUMINUM_BAR_LENGTH, " +
    "PMD.TOTAL_ALUMINUM_BAR_DEFECT as TOTAL_ALUMINUM_BAR_DEFECT, " +
    "PMD.TOTAL_WEIGHT_OF_ALUMINUM_DEFECTS as TOTAL_WEIGHT_OF_ALUMINUM_DEFECTS, " +
    "PMD.TOTAL_WEIGHT_OF_BILLET_DEFECTS as TOTAL_WEIGHT_OF_BILLET_DEFECTS, " +
    "PMD.END_TIME as END_TIME, " +
    "PMD.ACTUAL_WEIGHT as ACTUAL_WEIGHT, " +
    "ROW_NUMBER() over (partition by PMD.PRODUCT_LOT_NUMBER, PMD.PALLET_ID order by PMD.PR_KEY desc) as 'rw' " +
    "from PRODUCTION_MASTER_DETAIL PMD " +
    "where (PMD.STATUS = '110' or PMD.STATUS = '117') AND PMD.STAGE_TYPE IN('DE', 'HG')) A WHERE rw = 1 " +
    "ORDER BY A.PRODUCT_LOT_NUMBER ORDER BY A.STATUS_STRING desc, A.START_TIME"

let data = me.LoadingData({
    strQuery: queryString,
});

data.rows.forEach(row => {
    //kiểm tra xem có bản ghi HG chưa
    let isDuplicatedData = false;
    if (row.STAGE_TYPE == 'DE') {
        let checkExistedHGData = me.LoadingData({
            strQuery: "select PR_KEY from PRODUCTION_MASTER_DETAIL where PALLET_ID = '" + row.PALLET_ID +
                "' and PRODUCT_LOT_NUMBER = '" + row.PRODUCT_LOT_NUMBER + "' and STAGE_TYPE  = 'HG'"
        });
        isDuplicatedData = checkExistedHGData.getRowCount() > 0 ? true : false;

    }
    if (row.STATUS == '117' && row.STAGE_TYPE == 'HG') {
        let checkExistedHGData = me.LoadingData({
            strQuery: "select PR_KEY from PRODUCTION_MASTER_DETAIL where PALLET_ID = '" + row.PALLET_ID +
                "' and PRODUCT_LOT_NUMBER = '" + row.PRODUCT_LOT_NUMBER + "' and STAGE_TYPE  = 'HG' and STATUS = ''"
        });
        isDuplicatedData = checkExistedHGData.getRowCount() > 0 ? true : false;

    }
    if (!isDuplicatedData) {
        let WorkOrderData = me.LoadingData({
            strQuery: "select * from WORK_ORDERS where PR_KEY = " + row.WORK_ORDER_ID /* STRING [Required] */,
        });
        // let PurchaseOrderDetail;
        let queryString =
            "select WO.WORK_ORDER_CODE as WORK_ORDER_CODE, PODetail.PO_DETAILS_PROD_CODE as PO_DETAILS_PROD_CODE " +
            "from PRODUCTION_MASTER_DETAIL PMD " +
            "join WORK_ORDERS_DETAIL WOD on PMD.WORK_ORDER_DETAIL_ID = WOD.PR_KEY " +
            "join WORK_ORDERS WO on WOD.FR_KEY = WO.PR_KEY " +
            "join PURCHASE_ORDER_DETAILS PODetail on WOD.PURCHASE_ORDER_DETAIL_ID = PODetail.PR_KEY " +
            "where PMD.STAGE_TYPE = 'DE' and PMD.STATUS = '110' and PMD.PRODUCT_LOT_NUMBER = '" +
            row.PRODUCT_LOT_NUMBER +
            "' and PMD.PALLET_ID = '" +
            row.PALLET_ID +
            "'";
        let PurchaseOrderDetail = me.LoadingData({
            strQuery: queryString,
        });
        if (WorkOrderData.rows.length > 0) {
            // PurchaseOrderDetail = me.LoadingData({
            // 	strQuery: "select * from PURCHASE_ORDER_DETAILS where PR_KEY = " + WorkOrderData.rows[0].FR_KEY /* STRING [Required] */
            // });
        }

        let tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
        let CheckinData = row.START_TIME;

        let differenceMs = currentTime.getTime() - new Date(CheckinData).getTime();
        let seconds = Math.floor(differenceMs / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        let IsThisTimeInOvenTooLong = false;
        if (days > 0 || hours % 24 >= 24) {
            IsTimeInOvenTooLong = true;
            IsThisTimeInOvenTooLong = true;
        }
        let TOTAL_WAITING_TIME = days + "d " + (hours % 24) + "h " + (minutes % 60) + "m ";

        let ProductCodeData = "-";
        if (PurchaseOrderDetail.getRowCount() > 0) {
            ProductCodeData = PurchaseOrderDetail.rows[0].PO_DETAILS_PROD_CODE;
        }

        let WHM_PRODUCT_MASTER_DATA = me.LoadingData({
            strQuery:
                "select * from WHM_PRODUCT_MASTER where STAGE_TYPE = 'DE' and LOT_NUMBER = '" +
                row.PRODUCT_LOT_NUMBER +
                "' and PALLET_ID = '" +
                row.PALLET_ID +
                "'",
        });
        if (WHM_PRODUCT_MASTER_DATA.getRowCount() > 0) {
            let newEntry = {
                PALLET_ID: row.PALLET_ID, // STRING
                STATUS: row.STATUS, // STRING
                STATUS_STRING: row.STATUS_STRING, // STRING
                WORK_ORDER_ID: row.WORK_ORDER_ID, // NUMBER
                PRODUCT_CODE: ProductCodeData,
                PRODUCT_LOT_NUMBER: row.PRODUCT_LOT_NUMBER, // STRING
                WORK_ORDER_CODE: WorkOrderData.rows.length > 0 ? WorkOrderData.rows[0].WORK_ORDER_CODE : "-", // STRING
                TOTAL_ALUMINUM_BAR: row.TOTAL_ALUMINUM_BAR, // INTEGER
                START_TIME: row.START_TIME, // DATETIME
                WAITING_TIME_STRING: TOTAL_WAITING_TIME, // STRING
                STATUS_BOOLEAN_WAITING_OR_READY: (row.STATUS == "110" && row.STAGE_TYPE == 'DE') ? false : true,
                PR_KEY: row.PR_KEY, // NUMBER [Primary Key]
                WORK_LINE_ID: row.WORK_LINE_ID, // STRING
                STAGE_TYPE: row.STAGE_TYPE, // STRING
                WORK_SHIFT_ID: row.WORK_SHIFT_ID, // INTEGER
                ALUMINUM_BAR_LENGTH: row.ALUMINUM_BAR_LENGTH, // NUMBER
                TOTAL_ALUMINUM_BAR_DEFECT: row.TOTAL_ALUMINUM_BAR_DEFECT, // INTEGER
                TOTAL_WEIGHT_OF_ALUMINUM_DEFECTS: row.TOTAL_WEIGHT_OF_ALUMINUM_DEFECTS, // NUMBER
                TOTAL_WEIGHT_OF_BILLET_DEFECTS: row.TOTAL_WEIGHT_OF_BILLET_DEFECTS, // NUMBER
                END_TIME: row.END_TIME, // DATETIME
                ACTUAL_WEIGHT: row.ACTUAL_WEIGHT, // NUMBER
            };
            DataToShow.AddRow(newEntry);
        }
    }
});

////////////////////////////////////////////
//lọc theo điều kiện
for (let i = 0; i < DataToShow.rows.length; i++) {
    let now = DataToShow.getRowCount() > 0 ? DataToShow.rows[i].START_TIME : "-";
    let day = now.getDate();
    let month = now.getMonth() + 1; // Months are zero-based
    let year = now.getFullYear();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Add leading zeros if necessary
    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    let formattedDate = day + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;

    //if (me.DataTable.rows[i][fieldName] == valueField)
    //if ((!valueField || me.DataTable.rows[i].toString().toUpperCase().indexOf(valueField.toUpperCase()) >= 0) && me.DataTable.rows[i].IS_ACTIVE == setActive)
    //if ((!valueField || (me.DataTable.rows[i].COLOR_CODE.toString()+"◘"+me.DataTable.rows[i].COLOR_NAME.toString()).toUpperCase().indexOf(valueField.toUpperCase()) >= 0) && me.DataTable.rows[i].IS_ACTIVE == setActive)
    if (
        (!valueField ||
            containsStringIgnoringCaseAndUTF8(
                DataToShow.rows[i].PALLET_ID +
                "◘" +
                DataToShow.rows[i].STATUS_STRING +
                "◘" +
                DataToShow.rows[i].PRODUCT_CODE +
                "◘" +
                DataToShow.rows[i].PRODUCT_LOT_NUMBER +
                "◘" +
                DataToShow.rows[i].WORK_ORDER_CODE +
                "◘" +
                DataToShow.rows[i].TOTAL_ALUMINUM_BAR.toString() +
                "◘" +
                formattedDate +
                "◘" +
                DataToShow.rows[i].WAITING_TIME_STRING,
                valueField
            )) &&
        (!statusValue ? 1 == 1 : DataToShow.rows[i].STATUS == statusValue) &&
        (!fromTime ? 1 == 1 : DataToShow.rows[i].START_TIME >= fromTime) &&
        (!toTime ? 1 == 1 : DataToShow.rows[i].START_TIME <= toTime)
    ) {
        filteredData.AddRow(DataToShow.rows[i]);
    }
}

me.WaitingStandListRowNumbers = filteredData.getRowCount();

let paginatedInfortable = filteredData;
let sort = {
    name: "START_TIME",
    ascending: false,
};
paginatedInfortable.Sort(sort);
let params = {
    infoTableName: "DataFilter" /* STRING {"defaultValue":"InfoTable"} */,
    dataShapeName: "AES.DataShape.Manual.PRODUCTION_MASTER_DETAIL_FOR_WAITING_HG" /* DATASHAPENAME */,
};
// result: INFOTABLE
let paginatedResult = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape(params);
var numRows = paginatedInfortable.getRowCount();
var startRow = (pageNumber > 0 ? pageNumber - 1 : 0) * pageSize;
var numAdded = 0;

for (var r = startRow; r < numRows && numAdded < pageSize; r++) {
    paginatedResult.addRow(paginatedInfortable.getRow(r));
    numAdded++;
}

//me.WaitingStandListRowNumbers = paginatedResult.getRowCount();
result = paginatedResult;
