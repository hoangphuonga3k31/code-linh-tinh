
var i = 0;
Data.rows.toArray().forEach(row => {
    if (Flag == "ADD") {
        me.SetFlagExecute({
            stateFlag: "ADD" /* STRING [Required] */
        });
    }
    if (Flag == "EDIT") {
        row.INPUT_DATE = Date;
        row.BILLET_TREE_STATUS = "S";
        row.BILLET_TREE_INPUT_LENGTH = Length;
        row.UPDATED_BY = User;
        row.UPDATED_DATE = Date;


        // data cho bảng billet master
        let DataUpdateForBilletMaster = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
            infoTableName: "InfoTable",
            dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO",
        });

        let BilletMasterData = me.LoadingData({
            strQuery: "select * from PRODUCTION_BILLET_MASTER where MATERIAL_LOT_NUMBER = '" + row.MATERIAL_LOT_NUMBER + "' and STATUS != 'C'"
        });

        if (BilletMasterData.rows[0].STATUS == 'W') {
            BilletMasterData.rows[0].STATUS = 'P';
            BilletMasterData.rows[0].UPDATED_DATE = date;
            BilletMasterData.rows[0].UPDATED_BY = Resources["CurrentSessionInfo"].GetCurrentUser();
            DataUpdateForBilletMaster.AddRow(BilletMasterData.rows[0]);
        } else if (BilletMasterData.rows[0].STATUS == 'P') {
            let BilletInfoData = me.LoadingData({
                strQuery: "select count(*) as count from PRODUCTION_BILLET_INFO where WORK_ORDER_ID = " + BilletMasterData.rows[0].PR_KEY + " and MATERIAL_LOT_NUMBER = '" + row.MATERIAL_LOT_NUMBER + "' and BILLET_TREE_STATUS != ' '"
            });
            if (BilletInfoData.rows[0].count == (BilletMasterData.rows[0].QUALITY - BilletMasterData.rows[0].QUALITY_RETURN - 1)) {
                BilletMasterData.rows[0].STATUS = 'C';
                BilletMasterData.rows[0].UPDATED_DATE = date;
                BilletMasterData.rows[0].UPDATED_BY = Resources["CurrentSessionInfo"].GetCurrentUser();
                DataUpdateForBilletMaster.AddRow(BilletMasterData.rows[0]);
            }
        }

        if (DataUpdateForBilletMaster.getRowCount() > 0) {
            Things["CTA.Business.Categories.PRODUCTION_BILLET_MASTER"].SetExecuteData({
                Flag: "EDIT",
                Data: DataUpdateForBilletMaster
            });
        }
    }
    if (Flag == "EDIT_A") {
        row.BILLET_TREE_STATUS = "A";
        row.UPDATED_BY = User;
        row.UPDATED_DATE = Date;
    }
    if (Flag == "EDIT_D") {
        row.BILLET_TREE_STATUS = "D";
        row.UPDATED_BY = User;
        row.UPDATED_DATE = Date;
        row.TOTAL_DEFECTS_OF_BILLET = Length;
    }
    if (Flag == "EDIT_W") {
        row.BILLET_TREE_STATUS = "W";
        row.UPDATED_BY = User;
        row.UPDATED_DATE = Date;
        row.TOTAL_DEFECTS_OF_BILLET = Length;
    }

    if (Flag == "EDIT_C") {
        row.BILLET_TREE_STATUS = "C";
        row.UPDATED_BY = User;
        row.UPDATED_DATE = Date;
    }
});

me.SetFlagExecute({
    stateFlag: "EDIT" /* STRING [Required] */
});
me.DataTable_Execute = Data;
me.ExecuteData();
me.ReloadingStructure();
me.RefreshData();
result = 'DONE';