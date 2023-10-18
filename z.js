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

let A1P00String_LotBillet = me.X1_4M1_A1P00;
let A3C05String_NumberOfBilletTree = me.X1_4M1_A3C05;
let A3C03String_NumberOfBilletPart = me.X1_4M1_A3C03;
let A3C02String_BilletLength = me.X1_4M1_A3C02;
let A3SL0String_BilletLength = me.X1_4M1_A3SL0;

let currentShift = Things["CTA.Business.Product.PO.PurchaseOrder"].GetTimeDateAndShift();
let currentDatetime = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].GetdateTime();
let currentDatetimeToString = currentDatetime.getFullYear().toString() + "-" + (parseInt(currentDatetime.getMonth()) + 1).toString().padStart(2, '0') + "-" + currentDatetime.getDate().toString().padStart(2, '0') + " " + currentDatetime.getHours().toString().padStart(2, '0') + ":" + currentDatetime.getMinutes().toString().padStart(2, '0') + ":" + currentDatetime.getSeconds().toString().padStart(2, '0');

let newBillet = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER"
});

if (A1P00String_LotBillet.replace(/\s/g, "").length > 0) {
    // let WOData = me.LoadingData({
    //     strQuery: "select PR_KEY from WORK_ORDERS where WORK_ORDER_CODE = '" + A1P00String_LotBillet.substring(0, 16).replace(/\s/g, "") + "'" /* STRING [Required] */
    // });

    let LastPartNumberOfBillet = me.LoadingData({
        strQuery: "select max(PART_NUMBER_OF_BILLET) AS LastPartNumberOfBillet from PRODUCTION_MASTER where MATERIAL_LOT_NUMBER = '" + me.X1_4M1_A1P00.substring(16, 30).replace(/\s/g, '') + "' AND NUMBER_BILLET_TREE_CUT = " + (me.X1_4M1_A3C05 - 1)
    });

    let ProductionMasterData = me.LoadingData({
        strQuery: "select top 1 * from PRODUCTION_MASTER where MATERIAL_LOT_NUMBER = '" + me.X1_4M1_A1P00.substring(16, 30).replace(/\s/g, '') + "' and NUMBER_BILLET_TREE_CUT = " + (me.X1_4M1_A3C05 - 1) + " order by PART_NUMBER_OF_BILLET desc" /* STRING [Required] */
    });

    ProductionMasterData.rows[0].PART_NUMBER_OF_BILLET_STATUS = "D";
    ProductionMasterData.rows[0].PART_OF_BILLET_LENGTH_ACT = me.X1_4M1_A3SL0;
    ProductionMasterData.rows[0].PART_NUMBER_OF_BILLET = LastPartNumberOfBillet.rows[0].LastPartNumberOfBillet + 1;
    ProductionMasterData.rows[0].UPDATED_BY = Resources["CurrentSessionInfo"].GetCurrentUser();
    ProductionMasterData.rows[0].UPDATED_DATE = convertDateString(currentDatetimeToString);

    newBillet.AddRow(ProductionMasterData.rows[0]);

    Things["CTA.Business.Categories.ProductionMaster"].SetExecuteForMoldHeating({
        Data: newBillet /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_MASTER"} */,
        Flag: "ADD" /* STRING */
    });
}

if (newBillet.getRowCount() > 0) {

}

result = "ok";