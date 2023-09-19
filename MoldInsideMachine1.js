let MoldInsideOven1 = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO"
});

let ProductionMoldData = Things["CTA.Business.Production.Production_Mold_Info"].DataTable;

let currentShift = Things["CTA.Business.Product.PO.PurchaseOrder"].GetTimeDateAndShift();
let tzoffset = (new Date()).getTimezoneOffset() * 60000;

for (i = 0; i < 14; i++) {
    let inputData = me["X1_4M3_C1C" + i.toString().padStart(2, 0)];

    //Lấy dữ liệu mold id từ code trong string data
    if (inputData.replace(/\s/g, '').length > 0 && inputData.substring(36, 52).replace(/\s/g, '').length > 0) {
        let MoldMasterData = Things["CTA.Business.Categories.Md_Molds"].FilterDataTable({
            Condition: undefined /* STRING */,
            isServer: undefined /* BOOLEAN [Required] {"defaultValue":false} */,
            fieldName: "MOLD_CODE" /* STRING [Required] */,
            valueField: inputData.substring(0, 8).replace(/\s/g, '') /* STRING */
        });

        //lấy dữ liệu khuôn chờ gia nhiệt từ db
        let ProductionMoldData = me.LoadingData({
            strQuery: "select * from PRODUCTION_MOLD_INFO where MOLD_ID = " + MoldMasterData.rows[0].MOLD_ID + " and STATUS = '61'" /* STRING [Required] */
        });
        //gán dữ liệu vào infotable
        MoldInsideOven1.AddRow(ProductionMoldData.rows[0]);
    }
}

//đổi dữ liệu
MoldInsideOven1.rows.forEach(row => {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    row.CHECK_IN_DATE = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)
    row.STATUS = '62';
})
let val = Things["CTA.Business.Production.Production_Mold_Info"].SetExecuteData({
    Data: MoldInsideOven1 /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO"} */,
    Flag: 'EDIT' /* STRING */
});

//gán dữ liệu để hiển thị ra màn hình
me.MoldInsideMachineOven2 = MoldInsideOven1;

for (let i = me.newBillet.getRowCount() - 1; i >= 0; i--) {
    let checkExistData = me.LoadingData({
        strQuery: "select * from PRODUCTION_MOLD_INFO where MATERIAL_LOT_NUMBER = '" + me.newBillet.rows[i].MATERIAL_LOT_NUMBER + "' and PART_NUMBER_OF_BILLET = " + me.newBillet.rows[i].PART_NUMBER_OF_BILLET + " and NUMBER_BILLET_TREE = " + me.newBillet.rows[i].NUMBER_BILLET_TREE /* STRING [Required] */
    });
    if (checkExistData.getRowCount() > 0) {
        me.newBillet.RemoveRow(i);
    }
}

if (me.newBillet.getRowCount() > 0) {
    Things["CTA.Business.Production.Production_Mold_Info"].SetExecuteData({
        Data: me.newBillet /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO"} */,
        Flag: 'ADD' /* STRING */
    });
}
let resetNewBilletDataTable = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO"
});
me.newBillet = resetNewBilletDataTable

result = val;

//billet
me.OldBilletInsideMachineData = me.CurrentBilletInsidemachine;
me.CurrentBilletInsidemachine = me.LoadingData({
    strQuery: "select * from PRODUCTION_MOLD_INFO where STATUS = 'S'" /* STRING [Required] */
});