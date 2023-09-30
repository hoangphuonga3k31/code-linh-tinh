let WORK_ORDER_CODE = me.X1_4M3_C5P04.trim();

function updateWO(value) {
    Things["CTA.Business.Production.Dm_WorkOrders"].SetFlagExecute({
        stateFlag: "EDIT" /* STRING [Required] */
    });
    Things["CTA.Business.Production.Dm_WorkOrders"].DataTable_Execute = value;
    Things["CTA.Business.Production.Dm_WorkOrders"].ExecuteData();
}
Things["CTA.Business.Production.Dm_WorkOrders"].RefreshData();
let WO = me.LoadingData({
    strQuery: "SELECT * FROM WORK_ORDERS WHERE WORK_ORDER_CODE = '" + WORK_ORDER_CODE + "'" /* STRING [Required] */
});
if (WO.rows.length > 0) {
    let wod = me.LoadingData({
        strQuery: "SELECT * FROM WORK_ORDERS_DETAIL A JOIN PURCHASE_ORDER_DETAILS B ON A.PURCHASE_ORDER_DETAIL_ID = B.PR_KEY " +
            "WHERE A.FR_KEY = " + WO.PR_KEY + " AND B.PO_DETAILS_PROD_CODE = '" + me.X1_4M3_C5P06 + "'"
    });
    let PODetails = me.LoadingData({
        strQuery: "SELECT * FROM PURCHASE_ORDER_DETAILS WHERE PR_KEY = '" + wod.PURCHASE_ORDER_DETAIL_ID + "'" /* STRING [Required] */
    });
    let purchase_order = me.LoadingData({
        strQuery: "SELECT * FROM PURCHASE_ORDER WHERE PR_KEY = '" + PODetails.FR_KEY + "'"
    });
    let totalBarInPO = me.LoadingData({
        strQuery: "SELECT SUM(QUANTITY) AS TOTAL_PO FROM PURCHASE_ORDER_DETAILS WHERE FR_KEY = '" + purchase_order.PR_KEY + "'"
    });
    let WO_History = me.LoadingData({
        strQuery: "SELECT TOP(1) * FROM WORK_ORDERS_HISTORY WHERE FR_KEY = " + WO.PR_KEY + " ORDER BY PR_KEY DESC" /* STRING [Required] */
    });
    let newHistory = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: undefined /* STRING {"defaultValue":"InfoTable"} */,
        dataShapeName: "AES.DataShape.Dynamic.WORK_ORDERS_HISTORY" /* DATASHAPENAME */
    });
    let cur = new Date();
    let act = me.X1_4M3_C5SL0;
    let resultString = "a";
    if (WO.QUANTITY_PLAN <= (act + WO.QUANTITY_ACTUAL) && WO.STATUS != "5") { // số lượng >= YC không quá 1%  --  && act <= (WO.QUANTITY_PLAN * 1.01)
        // 		if (WO_History.CURRENT_STATUS != "5") {
        // 			newHistory.AddRow({
        // 				"FR_KEY": WO.PR_KEY,
        // 				"CURRENT_STATUS": "5",
        // 				"PREVIOUS_STATUS": WO_History.CURRENT_STATUS,
        // 				"UPDATED_DATE": cur,
        // 				"UPDATED_BY": Resources["CurrentSessionInfo"].GetCurrentUser(),
        // 				"DESCRIPTION": "",
        // 				"WORK_ORDER_DETAIL_ID": -1
        // 			});
        // 			Things["CTA.Business.Categories.WorkOrderHistory"].SetFlagExecute({
        // 				stateFlag: "ADD" /* STRING [Required] */
        // 			});
        // 			Things["CTA.Business.Categories.WorkOrderHistory"].DataTable_Execute = newHistory;
        // 			Things["CTA.Business.Categories.WorkOrderHistory"].ExecuteData();
        // 		}
        // 		// update WO
        // 		WO.STATUS = "5";
        // //		WO.QUANTITY_ACTUAL = WO.QUANTITY_ACTUAL + parseInt(act); // update 28/7
        // 		Things["CTA.Business.Production.Dm_WorkOrders"].SetFlagExecute({
        // 			stateFlag: "EDIT" /* STRING [Required] */
        // 		});
        // 		Things["CTA.Business.Production.Dm_WorkOrders"].DataTable_Execute = WO;
        // 		Things["CTA.Business.Production.Dm_WorkOrders"].ExecuteData();
        // 		Things["CTA.Common.Connect.ThingworxApps"].StopWO(); // Hoàn thành lệnh

        // Khuôn
        let MoldWillBackToWHMData = me.LoadingData({
            strQuery: "select WORK_ORDER_BOM.MOLD_ID as MoldId from WORK_ORDER_BOM JOIN WHM_MOLD_MASTER ON WORK_ORDER_BOM.MOLD_ID = WHM_MOLD_MASTER.MOLD_ID where WORK_ORDER_BOM.FR_KEY = " + WO.PR_KEY + " and WORK_ORDER_BOM.BOM_TYPE = 'MOLD' AND WHM_MOLD_MASTER.STATUS = '20' AND WORK_ORDER_BOM.IS_ACTIVE = 1" /* STRING [Required] */
        });

        let MoldIdArray = [];
        let MoldCodeArray = [];
        let WHMMoldMasterData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
            infoTableName: "InfoTable",
            dataShapeName: "AES.DataShape.Manual.WHM_MOLD_MASTER"
        });

        for (let i = 0; i < MoldWillBackToWHMData.getRowCount(); i++) {
            let MoldData = me.LoadingData({
                strQuery: "Select MOLD_CODE from MD_MOLDS where MOLD_ID = " + MoldWillBackToWHMData.rows[i].MoldId /* STRING [Required] */
            });
            MoldIdArray.push(MoldWillBackToWHMData.rows[i].MoldId);
            MoldCodeArray.push(MoldData.rows[0].MOLD_CODE);
        }

        let messageStringForMold = "";
        if (MoldIdArray.length > 0) {
            if (MoldIdArray.length == 1) {
                messageStringForMold += " và khuôn " + MoldCodeArray[0] + " cần được xuất về kho";
                let WHMMoldDataByID = me.LoadingData({
                    strQuery: "select * from WHM_MOLD_MASTER where MOLD_ID = " + MoldIdArray[0] /* STRING [Required] */
                });
                WHMMoldMasterData.AddRow(WHMMoldDataByID.rows[0]);
            } else {
                messageStringForMold += " và khuôn ";
                for (let j = 0; j < MoldCodeArray.length; j++) {
                    if (j != MoldCodeArray.length - 1) {
                        let WHMMoldDataByID = me.LoadingData({
                            strQuery: "select * from WHM_MOLD_MASTER where MOLD_ID = " + MoldIdArray[j] /* STRING [Required] */
                        });
                        WHMMoldMasterData.AddRow(WHMMoldDataByID.rows[0]);
                        messageStringForMold = messageStringForMold + MoldCodeArray[j] + ", ";
                    } else {
                        let WHMMoldDataByID = me.LoadingData({
                            strQuery: "select * from WHM_MOLD_MASTER where MOLD_ID = " + MoldIdArray[j] /* STRING [Required] */
                        });
                        WHMMoldMasterData.AddRow(WHMMoldDataByID.rows[0]);
                        messageStringForMold = messageStringForMold + MoldCodeArray[j] + " ";
                    }
                }
                messageStringForMold += "cần được xuất về kho";
            }
        }

        WHMMoldMasterData.rows.forEach(row => {
            row.STATUS = '10';
        });
        Things["CTA.Business.Warehouse.WHM_Mold_Master"].SetExecuteDataForCutToOrder({
            Data: WHMMoldMasterData /* INFOTABLE {"dataShape":"AES.DataShape.Manual.MoldExport"} */,
            Flag: "EDIT" /* STRING */,
            user: Resources["CurrentSessionInfo"].GetCurrentUser()
        });

        resultString = "Hoàn thành Lệnh sản xuất " + WORK_ORDER_CODE + messageStringForMold + "!";
        // Bảo dưỡng khuôn  //update 8/8
        //		let wo_bom = me.LoadingData({
        //			strQuery: "SELECT * FROM WORK_ORDER_BOM WHERE BOM_TYPE = 'MOLD' AND FR_KEY = " + WO.PR_KEY /* STRING [Required] */
        //		});
        //		let mold_master_data = me.LoadingData({
        //			strQuery: "SELECT * FROM WHM_MOLD_MASTER WHERE MOLD_ID = " + wo_bom.MOLD_ID /* STRING [Required] */
        //		});
        //		mold_master_data.STATUS = '30';
        //		Things["CTA.Business.Warehouse.WHM_Mold_Master"].DataTable_Execute = mold_master_data;
        //		Things["CTA.Business.Warehouse.WHM_Mold_Master"].SetFlagExecute({
        //			stateFlag: "EDIT" /* STRING [Required] */
        //		});
        //		Things["CTA.Business.Warehouse.WHM_Mold_Master"].ExecuteData();
        //		Things["CTA.Business.Warehouse.WHM_Mold_Master"].RefreshData();
        //Check hoàn thành PO
        // let completeAllWO = true;
        // let WOStatusListInPO = me.LoadingData({
        // 	strQuery: "SELECT STATUS FROM WORK_ORDERS WHERE FR_KEY IN (SELECT PR_KEY FROM PURCHASE_ORDER_DETAILS WHERE FR_KEY = '" + purchase_order.PR_KEY + "')"
        // });
        // let totalActualInWorkOrderList = me.LoadingData({
        // 	strQuery: "SELECT SUM(QUANTITY_ACTUAL) AS ACTUAL_WO FROM WORK_ORDERS WHERE FR_KEY IN (SELECT PR_KEY FROM PURCHASE_ORDER_DETAILS WHERE FR_KEY = '" + purchase_order.PR_KEY + "')"
        // });
        // WOStatusListInPO.rows.toArray().forEach(row => {
        // 	if (row.STATUS != 5 && row.STATUS != 4) {
        // 		completeAllWO = false;
        // 	}
        // });
        // if (completeAllWO) {
        // 	purchase_order.STATUS = '2';
        // 	Things["CTA.Business.Product.PO.PurchaseOrder"].DataTable_Execute = purchase_order;
        // 	Things["CTA.Business.Product.PO.PurchaseOrder"].SetFlagExecute({
        // 		stateFlag: "EDIT" /* STRING [Required] */
        // 	});
        // 	Things["CTA.Business.Product.PO.PurchaseOrder"].ExecuteData();
        // 	Things["CTA.Business.Product.PO.PurchaseOrder"].RefreshData();
        // }
    } else {
        if (WO.STATUS == "5") { // LSX được hoàn thành sớm
            WO.QUANTITY_ACTUAL = WO.QUANTITY_ACTUAL + parseInt(act); // update 28/7
            Things["CTA.Business.Production.Dm_WorkOrders"].SetFlagExecute({
                stateFlag: "EDIT" /* STRING [Required] */
            });
            Things["CTA.Business.Production.Dm_WorkOrders"].DataTable_Execute = WO;
            Things["CTA.Business.Production.Dm_WorkOrders"].ExecuteData();
            //			let completeAllWO = true;
            //			let WOStatusListInPO = me.LoadingData({
            //				strQuery: "SELECT STATUS FROM WORK_ORDERS WHERE FR_KEY IN (SELECT PR_KEY FROM PURCHASE_ORDER_DETAILS WHERE FR_KEY = '" + purchase_order.PR_KEY + "')"
            //			});
            //			WOStatusListInPO.rows.toArray().forEach(row => {
            //				if (row.STATUS != 5) {
            //					completeAllWO = false;
            //				}
            //			});
            //			if (completeAllWO) {
            //				purchase_order.STATUS = '2';
            //				Things["CTA.Business.Product.PO.PurchaseOrder"].DataTable_Execute = purchase_order;
            //				Things["CTA.Business.Product.PO.PurchaseOrder"].SetFlagExecute({
            //					stateFlag: "EDIT" /* STRING [Required] */
            //				});
            //				Things["CTA.Business.Product.PO.PurchaseOrder"].ExecuteData();
            //				Things["CTA.Business.Product.PO.PurchaseOrder"].RefreshData();
            //			}
            // let completeAllWO = true;
            // let WOStatusListInPO = me.LoadingData({
            // 	strQuery: "SELECT STATUS FROM WORK_ORDERS WHERE FR_KEY IN (SELECT PR_KEY FROM PURCHASE_ORDER_DETAILS WHERE FR_KEY = '" + purchase_order.PR_KEY + "')"
            // });
            // WOStatusListInPO.rows.toArray().forEach(row => {
            // 	if (row.STATUS != 5 && row.STATUS != 4) {
            // 		completeAllWO = false;
            // 	}
            // });
            // if (completeAllWO) {
            // 	purchase_order.STATUS = '2';
            // 	Things["CTA.Business.Product.PO.PurchaseOrder"].DataTable_Execute = purchase_order;
            // 	Things["CTA.Business.Product.PO.PurchaseOrder"].SetFlagExecute({
            // 		stateFlag: "EDIT" /* STRING [Required] */
            // 	});
            // 	Things["CTA.Business.Product.PO.PurchaseOrder"].ExecuteData();
            // 	Things["CTA.Business.Product.PO.PurchaseOrder"].RefreshData();
            // }
        }
    }
}