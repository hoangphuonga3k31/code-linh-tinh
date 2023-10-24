if (eventData.newValue.value == false) {
    me.Validate = "ERROR";
} else {
    var date = new Date();
    // result: INFOTABLE dataShape: "AES.DataShape.Dynamic.WHM_MATERIAL_VOUCHER_DETAILS"
    //    let Data = Things["CTA.Business.Warehouse.WHM_Material_Voucher_Details"].GetNewMaterialCopy();
    let Data = Things["CTA.Business.Warehouse.WHM_Material_Voucher_Details"].GetNewMaterialCopyCopy();
    Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteData({
        Data: Data /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.WHM_MATERIAL_VOUCHER_DETAILS"} */,
        Flag: "ADD" /* STRING */,
        user: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
        Date: date /* DATETIME */
    });

    me.SetUpdateBilletLoad();

    let Billet_info = me.LoadingData({
        strQuery: "SELECT top 1 * FROM PRODUCTION_BILLET_INFO WHERE BILLET_TREE_STATUS = ' ' order by UPDATED_DATE desc" /* STRING [Required] */,
    });

    let newDataForPMI = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MONITORING_INDEX"
    });

    let newEntryMIN = {
        WORK_ORDER_ID: Billet_info.rows[0].WORK_ORDER_ID, // NUMBER
        WORK_ORDER_DETAIL_ID: -1, // NUMBER
        WORK_LINE_ID: Billet_info.rows[0].MATERIAL_LOT_NUMBER, // STRING
        STAGE_TYPE: 'DE_BL', // STRING
        ITEM_ID: "MIN", // STRING
        TEMP: me.X1_4M1_A3P12, // NUMBER
        ELECTRICITY: -1, // NUMBER
        VALUE_TIME: eventData.newValue.time, // DATETIME
        ITEM_VALUE: 0, // NUMBER
        MOLD_ID: -1 // INTEGER
    };
    let newEntryMAX = {
        WORK_ORDER_ID: Billet_info.rows[0].WORK_ORDER_ID, // NUMBER
        WORK_ORDER_DETAIL_ID: -1, // NUMBER
        WORK_LINE_ID: Billet_info.rows[0].MATERIAL_LOT_NUMBER, // STRING
        STAGE_TYPE: 'DE_BL', // STRING
        ITEM_ID: "MAX", // STRING
        TEMP: me.X1_4M1_A3P11, // NUMBER
        ELECTRICITY: -1, // NUMBER
        VALUE_TIME: eventData.newValue.time, // DATETIME
        ITEM_VALUE: 0, // NUMBER
        MOLD_ID: -1 // INTEGER
    };
    let newEntrySTART = {
        WORK_ORDER_ID: Billet_info.rows[0].WORK_ORDER_ID, // NUMBER
        WORK_ORDER_DETAIL_ID: -1, // NUMBER
        WORK_LINE_ID: Billet_info.rows[0].MATERIAL_LOT_NUMBER, // STRING
        STAGE_TYPE: 'DE_BL', // STRING
        ITEM_ID: "START", // STRING
        TEMP: me.X1_4M1_A3ST0, // NUMBER
        ELECTRICITY: -1, // NUMBER
        VALUE_TIME: eventData.newValue.time, // DATETIME
        ITEM_VALUE: 0, // NUMBER
        MOLD_ID: -1 // INTEGER
    };
    let newEntryCENTER = {
        WORK_ORDER_ID: Billet_info.rows[0].WORK_ORDER_ID, // NUMBER
        WORK_ORDER_DETAIL_ID: -1, // NUMBER
        WORK_LINE_ID: Billet_info.rows[0].MATERIAL_LOT_NUMBER, // STRING
        STAGE_TYPE: 'DE_BL', // STRING
        ITEM_ID: "CENTER", // STRING
        TEMP: me.X1_4M1_A3ST1, // NUMBER
        ELECTRICITY: -1, // NUMBER
        VALUE_TIME: eventData.newValue.time, // DATETIME
        ITEM_VALUE: 0, // NUMBER
        MOLD_ID: -1 // INTEGER
    };
    let newEntryEND = {
        WORK_ORDER_ID: Billet_info.rows[0].WORK_ORDER_ID, // NUMBER
        WORK_ORDER_DETAIL_ID: -1, // NUMBER
        WORK_LINE_ID: Billet_info.rows[0].MATERIAL_LOT_NUMBER, // STRING
        STAGE_TYPE: 'DE_BL', // STRING
        ITEM_ID: "END", // STRING
        TEMP: me.X1_4M1_A3ST2, // NUMBER
        ELECTRICITY: -1, // NUMBER
        VALUE_TIME: eventData.newValue.time, // DATETIME
        ITEM_VALUE: 0, // NUMBER
        MOLD_ID: -1 // INTEGER
    };
    newDataForPMI.AddRow(newEntryMIN);
    newDataForPMI.AddRow(newEntryMAX);
    newDataForPMI.AddRow(newEntrySTART);
    newDataForPMI.AddRow(newEntryCENTER);
    newDataForPMI.AddRow(newEntryEND);

    Things["CTA.Business.Production.Production_Monitoring_Index"].SetExecuteData({
        Data: newDataForPMI /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_MASTER_DETAIL_PNT"} */,
        Flag: "ADD" /* STRING */
    });


}