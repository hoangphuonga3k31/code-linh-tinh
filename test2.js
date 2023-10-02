if (eventData.newValue.value > 0 && eventData.oldValue.value > 0 && eventData.newValue.value > eventData.oldValue.value) {
    let production_master = me.LoadingData({
        strQuery: "SELECT TOP(1) * FROM PRODUCTION_MASTER ORDER BY PR_KEY DESC" /* STRING [Required] */,
    });
    if (production_master.getRowCount() > 0) {
        let new_PR_KEY_Data = me.Get_Pr_Key({
            tableName: "PRODUCTION_MASTER" /* STRING */,
        });
        // Insert bản ghi của cây trước đó
        let OldBarData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
            infoTableName: "InfoTable",
            dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER",
        });

        production_master.rows[0].PR_KEY = new_PR_KEY_Data.rows[0].PR_KEY;
        production_master.rows[0].CUT_TIME = new Date();
        production_master.rows[0].PART_OF_BILLET_LENGTH_ACT = eventData.oldValue.value;
        production_master.rows[0].PART_NUMBER_OF_BILLET = production_master.rows[0].PART_NUMBER_OF_BILLET + 1;
        production_master.rows[0].PART_NUMBER_OF_BILLET_STATUS = "A";
        OldBarData.AddRow(production_master.rows[0]);

        Things["CTA.Business.Categories.ProductionMaster"].DataTable_Execute = OldBarData;
        Things["CTA.Business.Categories.ProductionMaster"].SetFlagExecute({
            stateFlag: "ADD" /* STRING [Required] */,
        });
        Things["CTA.Business.Categories.ProductionMaster"].ExecuteData();

        //insert bản ghi của cây sau
        let NewBarData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
            infoTableName: "InfoTable",
            dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER",
        });

        let BilletInfoData = me.LoadingData({
            strQuery: "select top 1 MATERIAL_LOT_NUMBER from PRODUCTION_BILLET_INFO where BILLET_TREE_STATUS = 'S'",
        });

        let RunningWO = me.LoadingData({
            strQuery: "select PR_KEY from WORK_ORDERS where STATUS = '2' and WORK_ORDER_TYPE = 'W_DEP'",
        });

        production_master.rows[0].PR_KEY = new_PR_KEY_Data.rows[0].PR_KEY + 1;
        production_master.rows[0].CUT_TIME = new Date();
        production_master.rows[0].MATERIAL_LOT_NUMBER = BilletInfoData.rows[0].MATERIAL_LOT_NUMBER;
        production_master.rows[0].WORK_ORDER_ID = RunningWO.rows[0].PR_KEY;
        production_master.rows[0].PART_NUMBER_OF_BILLET_STATUS = "S";
        production_master.rows[0].PART_NUMBER_OF_BILLET = 1;
        production_master.rows[0].NUMBER_BILLET_TREE_CUT = production_master.rows[0].NUMBER_BILLET_TREE_CUT + 1;
        //   production_master.rows[0].PART_OF_BILLET_LENGTH_ACT = me.X1_4M1_A3P15 - eventData.oldValue.value;
        production_master.rows[0].PART_OF_BILLET_LENGTH_ACT = me.X1_4M1_A3SL0 - eventData.oldValue.value;
        //        production_master.MOLD_ID = mold_Data.MOLD_ID;
        NewBarData.AddRow(production_master.rows[0]);
        Things["CTA.Business.Categories.ProductionMaster"].DataTable_Execute = NewBarData;
        Things["CTA.Business.Categories.ProductionMaster"].SetFlagExecute({
            stateFlag: "ADD" /* STRING [Required] */,
        });
        Things["CTA.Business.Categories.ProductionMaster"].ExecuteData();

    }
} else if (eventData.newValue.value > 0 && eventData.oldValue.value < 0 && (eventData.newValue.value > eventData.oldValue.value)) {
    let production_master = me.LoadingData({
        strQuery: "SELECT TOP(1) * FROM PRODUCTION_MASTER ORDER BY PR_KEY DESC" /* STRING [Required] */,
    });
    if (production_master.getRowCount() > 0) {
        let new_PR_KEY_Data = me.Get_Pr_Key({
            tableName: "PRODUCTION_MASTER" /* STRING */,
        });
        // Insert bản ghi của cây trước đó
        let OldBarData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
            infoTableName: "InfoTable",
            dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER",
        });

        production_master.rows[0].PR_KEY = new_PR_KEY_Data.rows[0].PR_KEY;
        production_master.rows[0].CUT_TIME = new Date();
        production_master.rows[0].PART_OF_BILLET_LENGTH_ACT = me.X1_4M1_A3SL0 - (me.X1_4M1_A3SE0 - eventData.newValue.value);
        production_master.rows[0].PART_NUMBER_OF_BILLET = production_master.rows[0].PART_NUMBER_OF_BILLET + 1;
        production_master.rows[0].PART_NUMBER_OF_BILLET_STATUS = "A";
        OldBarData.AddRow(production_master.rows[0]);

        Things["CTA.Business.Categories.ProductionMaster"].DataTable_Execute = OldBarData;
        Things["CTA.Business.Categories.ProductionMaster"].SetFlagExecute({
            stateFlag: "ADD" /* STRING [Required] */,
        });
        Things["CTA.Business.Categories.ProductionMaster"].ExecuteData();

        //insert bản ghi của cây sau
        let NewBarData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
            infoTableName: "InfoTable",
            dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER",
        });

        let BilletInfoData = me.LoadingData({
            strQuery: "select top 1 MATERIAL_LOT_NUMBER from PRODUCTION_BILLET_INFO where BILLET_TREE_STATUS = 'S'",
        });

        let RunningWO = me.LoadingData({
            strQuery: "select PR_KEY from WORK_ORDERS where STATUS = '2' and WORK_ORDER_TYPE = 'W_DEP'",
        });

        production_master.rows[0].PR_KEY = new_PR_KEY_Data.rows[0].PR_KEY + 1;
        production_master.rows[0].CUT_TIME = new Date();
        production_master.rows[0].MATERIAL_LOT_NUMBER = BilletInfoData.rows[0].MATERIAL_LOT_NUMBER;
        production_master.rows[0].WORK_ORDER_ID = RunningWO.rows[0].PR_KEY;
        production_master.rows[0].PART_NUMBER_OF_BILLET_STATUS = "S";
        production_master.rows[0].PART_NUMBER_OF_BILLET = 1;
        production_master.rows[0].NUMBER_BILLET_TREE_CUT = production_master.rows[0].NUMBER_BILLET_TREE_CUT + 1;
        //   production_master.rows[0].PART_OF_BILLET_LENGTH_ACT = me.X1_4M1_A3P15 - eventData.oldValue.value;
        production_master.rows[0].PART_OF_BILLET_LENGTH_ACT = me.X1_4M1_A3SE0 - eventData.newValue.value;
        //        production_master.MOLD_ID = mold_Data.MOLD_ID;
        NewBarData.AddRow(production_master.rows[0]);
        Things["CTA.Business.Categories.ProductionMaster"].DataTable_Execute = NewBarData;
        Things["CTA.Business.Categories.ProductionMaster"].SetFlagExecute({
            stateFlag: "ADD" /* STRING [Required] */,
        });
        Things["CTA.Business.Categories.ProductionMaster"].ExecuteData();

    }
}
