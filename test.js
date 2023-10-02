let convertDateString = (dateString) => {
    var parts = dateString.split('/');
    var isoString;

    if (parts.length === 3) {
        isoString = new Date(parts[2], parts[1] - 1, parts[0]);
        isoString = isoString.toISOString();
    } else {
        isoString = dateString.replace(' ', 'T') + 'Z';
    }
    return isoString.toString();
};

let currentDatetime = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].GetdateTime();
let currentDatetimeToString = currentDatetime.getFullYear().toString() + "-" + (parseInt(currentDatetime.getMonth()) + 1).toString().padStart(2, '0') + "-" + currentDatetime.getDate().toString().padStart(2, '0') + " " + currentDatetime.getHours().toString().padStart(2, '0') + ":" + currentDatetime.getMinutes().toString().padStart(2, '0') + ":" + currentDatetime.getSeconds().toString().padStart(2, '0');

let NewData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER_DETAIL"
});

let NewDataFor_Work_Order_Config = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.WORK_ORDERS_DETAIL"
});

let NewDataForWHMProductMaster = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.WHM_PRODUCT_MASTER"
});

if (Data && Data != undefined && Data.rows.length > 0) {
    let WODetail_PR_KEY = me.Get_Pr_Key({
        tableName: "WORK_ORDERS_DETAIL" /* STRING */
    });
    let WODetail_PR_KEY_index = 0;
    Data.rows.forEach(row => {
        let ProductionMasterDetailDataStageDE = me.LoadingData({
            strQuery: "select * from PRODUCTION_MASTER_DETAIL where PALLET_ID = '" + row.PALLET_ID + "' and PRODUCT_LOT_NUMBER = '" + row.PRODUCT_LOT_NUMBER + "' and STATUS = '110' and STAGE_TYPE = 'DE'" /* STRING [Required] */
        });
        // AES.DataShape.Dynamic.PRODUCTION_MASTER_DETAIL entry object
        if (ProductionMasterDetailDataStageDE.getRowCount() > 0) {


            let DataFromDEStage = me.LoadingData({
                strQuery: "select WORK_ORDER_ID from PRODUCTION_MASTER_DETAIL where STAGE_TYPE = 'DE' and PRODUCT_LOT_NUMBER = '" + ProductionMasterDetailDataStageDE.rows[0].PRODUCT_LOT_NUMBER + "' and PALLET_ID = '" + row.PALLET_ID + "'" /* STRING [Required] */
            });
            let WODataFromDEStage = me.LoadingData({
                strQuery: "select FR_KEY from WORK_ORDERS where PR_KEY = " + DataFromDEStage.rows[0].WORK_ORDER_ID /* STRING [Required] */
            });
            let WODetailDataFromDEStage = me.LoadingData({
                strQuery: "select PURCHASE_ORDER_DETAIL_ID from WORK_ORDERS_DETAIL where PR_KEY = " + ProductionMasterDetailDataStageDE.rows[0].WORK_ORDER_DETAIL_ID
            });

            let newEntryFor_WO_Detail = {
                PR_KEY: WODetail_PR_KEY.rows[0].PR_KEY + WODetail_PR_KEY_index,
                FR_KEY: WO_ID, // NUMBER
                PALLET_ID: row.PALLET_ID, // STRING
                PRODUCT_LOT_NUMBER: ProductionMasterDetailDataStageDE.rows[0].PRODUCT_LOT_NUMBER, // STRING
                PURCHASE_ORDER_DETAIL_ID: WODetailDataFromDEStage.getRowCount() > 0 ? WODetailDataFromDEStage.rows[0].PURCHASE_ORDER_DETAIL_ID : -1, // NUMBER
                QUANTITY_PLAN: ProductionMasterDetailDataStageDE.rows[0].TOTAL_ALUMINUM_BAR, // INTEGER
                WEIGHT_PLAN: ProductionMasterDetailDataStageDE.rows[0].ACTUAL_WEIGHT, // NUMBER
                STATUS: '0', // STRING
                NUMBER_OF_HANGER_BEAMS: -1, // INTEGER
                ACTIVE: 0, // BOOLEAN
                CREATED_DATE: convertDateString(currentDatetimeToString), // DATETIME
                CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                UPDATED_DATE: convertDateString(currentDatetimeToString), // DATETIME
                UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
            };
            NewDataFor_Work_Order_Config.AddRow(newEntryFor_WO_Detail);
            WODetail_PR_KEY_index++;

            let newEntry = {
                WORK_ORDER_ID: WO_ID, // NUMBER
                WORK_LINE_ID: "Line_04", // STRING
                WORK_SHIFT_ID: -1, // INTEGER
                STAGE_TYPE: "HG", // STRING
                PRODUCT_LOT_NUMBER: ProductionMasterDetailDataStageDE.rows[0].PRODUCT_LOT_NUMBER, // STRING
                PALLET_ID: row.PALLET_ID, // STRING
                STATUS: "110", // STRING
                ALUMINUM_BAR_LENGTH: ProductionMasterDetailDataStageDE.rows[0].ALUMINUM_BAR_LENGTH, // NUMBER
                TOTAL_ALUMINUM_BAR: ProductionMasterDetailDataStageDE.rows[0].TOTAL_ALUMINUM_BAR, // INTEGER
                TOTAL_ALUMINUM_BAR_DEFECT: ProductionMasterDetailDataStageDE.rows[0].TOTAL_ALUMINUM_BAR_DEFECT, // INTEGER
                TOTAL_WEIGHT_OF_ALUMINUM_DEFECTS: ProductionMasterDetailDataStageDE.rows[0].TOTAL_WEIGHT_OF_ALUMINUM_DEFECTS, // NUMBER
                TOTAL_WEIGHT_OF_BILLET_DEFECTS: ProductionMasterDetailDataStageDE.rows[0].TOTAL_WEIGHT_OF_BILLET_DEFECTS, // NUMBER
                START_TIME: ProductionMasterDetailDataStageDE.rows[0].START_TIME, // DATETIME
                END_TIME: ProductionMasterDetailDataStageDE.rows[0].END_TIME, // DATETIME
                ACTUAL_WEIGHT: ProductionMasterDetailDataStageDE.rows[0].ACTUAL_WEIGHT, // NUMBER
                //WORK_ORDER_DETAIL_ID: ProductionMasterDetailDataStageDE.rows[0].WORK_ORDER_DETAIL_ID // NUMBER
                WORK_ORDER_DETAIL_ID: newEntryFor_WO_Detail.PR_KEY
            };
            NewData.AddRow(newEntry);
        }
    });
}

if (NewData.getRowCount() > 0) {
    Things["CTA.Business.Categories.Production_Master_Details"].SetExecuteData({
        Data: NewData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_MASTER_DETAIL"} */,
        id: undefined /* STRING */,
        Flag: "ADD" /* STRING */
    });
}

if (NewDataFor_Work_Order_Config.getRowCount() > 0) {
    Things["CTA.Business.Production.Work_Orders_Details"].SetExecuteDataForAging({
        Data: NewDataFor_Work_Order_Config /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_MASTER_DETAIL"} */,
        Flag: "ADD" /* STRING */
    });
}