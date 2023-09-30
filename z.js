// result: INFOTABLE dataShape: "AES.DataShape.Manual.TimeDateAndShift"
let TimeDateShift = Things["CTA.Business.Product.PO.PurchaseOrder"].GetTimeDateAndShift();
// result: DATETIME
let currentDate = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].GetdateTime();

me.b = 'reheating';
let WHMMoldDataForReHeating = me.LoadingData({
    strQuery: "select * from WHM_MOLD_MASTER where STATUS = '63'" /* STRING [Required] */,
});
WHMMoldDataForReHeating.rows[0].STATUS = "61";
let MoldMasterData = me.LoadingData({
    strQuery: "select MOLD_ID, MOLD_CODE, ERP_MOLD_CODE from MD_MOLDS where MOLD_ID = " + WHMMoldDataForReHeating.rows[0].MOLD_ID,
});
let WOID = -1;
let RunningWOData = me.LoadingData({
    strQuery: "select PR_KEY, WORK_ORDER_CODE from WORK_ORDERS where STATUS = '2' and WORK_ORDER_TYPE = 'W_DEP'",
});
if (RunningWOData.getRowCount() > 0) {
    WOID = RunningWOData.rows[0].PR_KEY;
}

// CreateInfoTableFromDataShape(infoTableName:STRING("InfoTable"), dataShapeName:STRING):INFOTABLE(AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO)
let newData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO",
});

// AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO entry object
let newEntry = {
    WORK_ORDER_ID: WOID, // NUMBER
    WORK_LINE_ID: "Line_04", // STRING
    WORK_SHIFT_ID: TimeDateShift.rows[0].SHIFT, // INTEGER
    MATERIAL_ID: -1, // INTEGER
    MATERIAL_LOT_NUMBER: " ", // STRING
    MATL_SHORT_CUT_LENGTH_ACT: -1, // NUMBER
    NUMBER_BILLET_TREE: -1, // INTEGER
    PART_NUMBER_OF_BILLET: -1, // INTEGER
    MOLD_ID: WHMMoldDataForReHeating.rows[0].MOLD_ID, // INTEGER
    CHECK_IN_DATE: currentDate, // DATETIME
    CHECK_OUT_DATE: currentDate, // DATETIME
    STATUS: "61", // STRING
    NUMBER_OF_OVEN: -1, // INTEGER
    TO_WORK_ORDER_ID: -1, // NUMBER
    TO_WORK_LINE_ID: -1, // STRING
    CREATED_DATE: currentDate, // DATETIME
    CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
    UPDATED_DATE: currentDate, // DATETIME
    UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
};
newData.AddRow(newEntry);
let val = Things["CTA.Business.Production.Production_Mold_Info"].SetExecuteDataForReheatingMold({
    Data: newData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO"} */,
    Flag: "ADD" /* STRING */,
});

Things["CTA.Business.Warehouse.WHM_Mold_Master"].SetExecuteDataForReHeatingMold({
    WorkOrderIDFromCode: WOID /* NUMBER */,
    Data: WHMMoldDataForReHeating /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.WHM_MOLD_MASTER"} */,
    Flag: "EDIT" /* STRING */,
    user: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
    WorkLineID: "Line_04" /* STRING */,
});

for (let i = 0; i < 20; i++) {
    let tagName = "X1_4M3_C1P" + (i + 2).toString().padStart(2, "0");
    let tagData = me[tagName];
    if (tagData.length == 0 || tagData.replace(/\s/g, "").length == 0) {
        me[tagName] =
            MoldMasterData.rows[0].MOLD_CODE.padEnd(8, " ") +
            MoldMasterData.rows[0].ERP_MOLD_CODE.padEnd(28, " ") +
            RunningWOData.WORK_ORDER_CODE.padEnd(16, " ");
        break;
    }
}

me.b = 'done reheating';