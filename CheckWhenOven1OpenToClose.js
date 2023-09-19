let MoldInsideOven1 = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO"
});

for (i = 0; i < 14; i++) {
    let inputData = me["X1_4M3_C1C" + i.toString().padStart(2, 0)];

    // AES.DataShape.Manual.MoldHeating_MoldInsideMachine entry object

    if (inputData.replace(/\s/g, '').length > 0 && inputData.substring(36, 52).replace(/\s/g, '').length > 0) {
        let MoldMasterData = Things["CTA.Business.Categories.Md_Molds"].FilterDataTable({
            Condition: undefined /* STRING */,
            isServer: undefined /* BOOLEAN [Required] {"defaultValue":false} */,
            fieldName: "MOLD_CODE" /* STRING [Required] */,
            valueField: inputData.substring(0, 8).replace(/\s/g, '') /* STRING */
        });
        // AES.DataShape.Dynamic.PRODUCTION_MOLD_INFO entry object
        let newEntry = {
            PR_KEY: undefined, // NUMBER [Primary Key]
            WORK_ORDER_ID: undefined, // NUMBER
            WORK_LINE_ID: undefined, // STRING
            WORK_SHIFT_ID: undefined, // INTEGER
            MATERIAL_ID: undefined, // INTEGER
            MATERIAL_LOT_NUMBER: undefined, // STRING
            MATL_SHORT_CUT_LENGTH_ACT: undefined, // NUMBER
            NUMBER_BILLET_TREE: undefined, // INTEGER
            PART_NUMBER_OF_BILLET: undefined, // INTEGER
            MOLD_ID: undefined, // INTEGER
            CHECK_IN_DATE: undefined, // DATETIME
            CHECK_OUT_DATE: undefined, // DATETIME
            STATUS: undefined, // STRING
            NUMBER_OF_OVEN: undefined, // INTEGER
            TO_WORK_ORDER_ID: undefined, // NUMBER
            TO_WORK_LINE_ID: undefined, // STRING
            CREATED_DATE: undefined, // DATETIME
            CREATED_BY: undefined, // STRING
            UPDATED_DATE: undefined, // DATETIME
            UPDATED_BY: undefined // STRING
        };

    }
}

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