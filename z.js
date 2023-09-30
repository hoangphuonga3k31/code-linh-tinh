if (eventData.newValue.value == false) {
    let a = 1;
} else {
    //	me.A1P01_String = Things["CTA.Common.BindingData_BilletHeating_Line4"].X1_4M1_A1P00;
    // update code khi A1P00 không chứa cây đang cắt nóng
    let billetInfo = me.LoadingData({
        strQuery: "SELECT TOP(1) * FROM PRODUCTION_BILLET_INFO WHERE BILLET_TREE_STATUS = 'A' ORDER BY PR_KEY DESC"
    });
    let work_order_code;
    if (billetInfo.TO_WORK_ORDER_ID != -1) {
        work_order_code = me.LoadingData({
            strQuery: "SELECT WORK_ORDER_CODE FROM WORK_ORDERS WHERE PR_KEY = " + billetInfo.TO_WORK_ORDER_ID
        });
    } else {
        work_order_code = me.LoadingData({
            strQuery: "SELECT WORK_ORDER_CODE FROM WORK_ORDERS WHERE PR_KEY = " + billetInfo.WORK_ORDER_ID
        });
    }
    me.A1P01_String = work_order_code.WORK_ORDER_CODE.padEnd(16, " ") + billetInfo.MATERIAL_LOT_NUMBER.padEnd(14, " ") + billetInfo.NUMBER_BILLET_TREE_INPUT.toString().padEnd(2, " ");
    //
    let production_master = me.LoadingData({
        strQuery: "SELECT TOP(2) * FROM PRODUCTION_MASTER ORDER BY PR_KEY DESC" /* STRING [Required] */
    });
    if (production_master.rows[0].PART_NUMBER_OF_BILLET_STATUS == 'S') {
        production_master.rows[0].PART_NUMBER_OF_BILLET_STATUS = 'A';
        if (production_master.rows[0].PART_NUMBER_OF_BILLET == 1) {
            let RemainLength = Things["CTA.Common.Categories.BilletHeating_ScanMSSQL500ms"].NextLength;
            if (RemainLength != 0) {
                production_master.rows[0].ALUMINUM_BAR_LENGTH = Things["CTA.Common.Categories.BilletHeating_ScanMSSQL500ms"].X1_4M1_A3SL0 - RemainLength;
                Things["CTA.Common.Categories.BilletHeating_ScanMSSQL500ms"].X1_4M1_A3SL0 = 0;

                production_master.rows[1].PART_NUMBER_OF_BILLET = production_master.rows[1].PART_NUMBER_OF_BILLET + 1;
                production_master.rows[1].PART_NUMBER_OF_BILLET_STATUS = 'A';
                production_master.rows[1].PART_OF_BILLET_LENGTH_ACT = RemainLength;

                let NewData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
                    infoTableName: "InfoTable",
                    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER"
                });
                NewData.AddRow(production_master.rows[1]);
                Things["CTA.Business.Categories.ProductionMaster"].DataTable_Execute = NewData;
                Things["CTA.Business.Categories.ProductionMaster"].SetFlagExecute({
                    stateFlag: 'ADD' /* STRING [Required] */
                });
                Things["CTA.Business.Categories.ProductionMaster"].ExecuteData();

            }
        }
        production_master.RemoveRow(1);
        //        production_master.MOLD_ID = mold_Data.MOLD_ID;
        Things["CTA.Business.Categories.ProductionMaster"].DataTable_Execute = production_master;
        Things["CTA.Business.Categories.ProductionMaster"].SetFlagExecute({
            stateFlag: 'EDIT' /* STRING [Required] */
        });
        Things["CTA.Business.Categories.ProductionMaster"].ExecuteData();
    }
    me.C1C45_Sensor = ' ';
}
// set dữ liệu vào tag
let wo = me.GetWorkOrderByWorkLine();
if (wo.rows.length > 0) {
    //	let valPO = me.LoadingData({
    //		strQuery: "SELECT * FROM PURCHASE_ORDER_DETAILS WHERE PR_KEY = " + wo.FR_KEY /* STRING [Required] */
    //	});
    //    me.X1_4M2_B1P12 = valPO.PO_DETAILS_PROD_CODE;
    //    let list_PO_Deatils_Prod_Code = me.LoadingData({
    //    	strQuery: "select PO_DETAILS_PROD_CODE from PURCHASE_ORDER_DETAILS where PR_KEY in(select PURCHASE_ORDER_DETAIL_ID from WORK_ORDERS_DETAIL where FR_KEY = " + wo.PR_KEY + ")"
    //    });
    //    let loop_number = list_PO_Deatils_Prod_Code.rows.length > 30 ? 30 : list_PO_Deatils_Prod_Code.rows.length;
    //    for(let i = 0; i < loop_number; i++){
    //    	let tagID = 'X1_4M2_B1P' + 15 + i;
    //        me[tagID] = list_PO_Deatils_Prod_Code.rows[i].PO_DETAILS_PROD_CODE;
    //    }

    let LOT_PRODUCT = me.GetLotProduct();
    //	me.X1_4M2_B1P10 = wo.WORK_ORDER_CODE;
    //	me.X1_4M2_B1M04 = (wo.STATUS === '2') ? true : false;
    Things["CTA.Common.BindingData_PullAndCut_Line4"].X1_4M3_C3P00 = wo.WORK_ORDER_CODE;
    //	me.X1_4M2_B1P11 = LOT_PRODUCT;
    Things["CTA.Common.BindingData_PullAndCut_Line4"].X1_4M3_C3P01 = LOT_PRODUCT;

    let lot = me.GetBilletInformation();
    if (lot.rows.length > 0) {
        me.X1_4M2_B1P08 = lot.LOT_BILLET;
        //		me.X1_4M2_B1P13 = lot.SEGMENT_NUMBER;
        me.X1_4M2_B1C01 = lot.BILLET_WIDTH;
        me.X1_4M2_B1P47 = lot.NUMBER_BILLET;
        let material_voucher_detail = me.LoadingData({
            strQuery: "select distinct(B.MATERIAL_CODE) from WHM_MATERIAL_VOUCHER_DETAILS A join MD_MATERIALS B on A.MATERIAL_ID = B.MATERIAL_ID " +
                "where WORK_ORDER_ID = '" + wo.PR_KEY + "' and LOT_NUMBER = '" + lot.LOT_BILLET + "'"
        });
        me.X1_4M2_B1P46 = material_voucher_detail.rows.length > 0 ? material_voucher_detail.rows[0].MATERIAL_CODE : '          ';
    }

    let mold = me.GetCurentMoldCode();
    if (mold.rows.length > 0) {
        let moldString = mold.MOLD_ID + ' - ' + mold.MOLD_CODE;
        if (moldString != me.X1_4M2_B1P09) {
            let currentMoldStringTag = me.X1_4M2_B1P09.split('-');
            let mold_info = me.LoadingData({
                strQuery: "select * from PRODUCTION_MOLD_INFO where MOLD_ID = (SELECT MOLD_ID FROM MD_MOLDS WHERE MOLD_CODE = '" + currentMoldStringTag[0] + "')"
            });
            mold_info.STATUS = 'W';
            Things["CTA.Business.Production.Production_Mold_Info"].DataTable_Execute.AddRow(mold_info.rows[0]);
            Things["CTA.Business.Production.Production_Mold_Info"].SetFlagExecute({
                stateFlag: "EDIT"
            });
            Things["CTA.Business.Production.Production_Mold_Info"].ExecuteData();

            let mold_master = me.LoadingData({
                strQuery: "select * from WHM_MOLD_MASTER where MOLD_ID = (SELECT MOLD_ID FROM MD_MOLDS WHERE MOLD_CODE = '" + currentMoldStringTag[0] + "')"
            });
            mold_master.STATUS = '30';
            Things["CTA.Business.Warehouse.WHM_Mold_Master"].DataTable_Execute.AddRow(mold_master.rows[0]);
            Things["CTA.Business.Warehouse.WHM_Mold_Master"].SetFlagExecute({
                stateFlag: "EDIT" /* STRING [Required] */
            });
            Things["CTA.Business.Warehouse.WHM_Mold_Master"].ExecuteData();
        }
        me.X1_4M2_B1P09 = mold.MOLD_ID + ' - ' + mold.MOLD_CODE;
    }
}