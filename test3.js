let Billet_info = me.LoadingData({
	strQuery: "SELECT * FROM PRODUCTION_BILLET_INFO WHERE BILLET_TREE_STATUS = ' '" /* STRING [Required] */
});
let DataList = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
	infoTableName: "InfoTable",
	dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"
});
let sort = {
	name: "PR_KEY",
	ascending: false
};
Billet_info.Sort(sort);
if (Billet_info.getRowCount() > 0) {
	let WorkOrders
	if (Billet_info.rows[0].TO_WORK_ORDER_ID == -1) {
		WorkOrders = me.LoadingData({
			strQuery: "SELECT * FROM WORK_ORDERS WHERE PR_KEY =" + Billet_info.rows[0].WORK_ORDER_ID  /* STRING [Required] */
		});
	} else {
		WorkOrders = me.LoadingData({
			strQuery: "SELECT * FROM WORK_ORDERS WHERE PR_KEY =" + Billet_info.rows[0].TO_WORK_ORDER_ID  /* STRING [Required] */
		});
	}

	// let PODetail = me.LoadingData({
	// 	strQuery: "select * from PURCHASE_ORDER_DETAILS where PR_KEY = " + WorkOrders.rows[0].FR_KEY
	// })

	// let Quantity = me.LoadingData({
	//     strQuery: "select QUANTITY_2 from PURCHASE_ORDER_BOM where BOM_TYPE = 'MATL' AND FR_KEY ="+ PODetail.rows[0].PR_KEY /* STRING [Required] */
	// });
	let DataTime = me.LoadingData({
		strQuery: "select DATEDIFF(MINUTE, INPUT_DATE, GETDATE())/60 AS INPUT_TIME, DATEDIFF(MINUTE, INPUT_DATE, GETDATE()) AS INPUT_DATE from PRODUCTION_BILLET_INFO where PR_KEY = " + Billet_info.rows[0].PR_KEY /* STRING [Required] */
	});
	let time = DataTime.rows[0].INPUT_TIME + "h " + (DataTime.rows[0].INPUT_DATE - (DataTime.rows[0].INPUT_TIME * 60)) + "m";

	// let ProductionMaster = Things["CTA.Business.Categories.ProductionMaster"].FilterDataTable({
	// 	Condition: undefined /* STRING */,
	// 	isServer: false /* BOOLEAN [Required] {"defaultValue":false} */,
	// 	fieldName: "WORK_ORDER_ID" /* STRING [Required] */,
	// 	valueField: Billet_info.rows[0].WORK_ORDER_ID /* STRING */
	// });
	let ProductionMaster = me.LoadingData({
		strQuery: "select * from PRODUCTION_MASTER where WORK_ORDER_ID = " + Billet_info.rows[0].WORK_ORDER_ID
	})

	let length = 0;
	for (i = 0; i < ProductionMaster.getRowCount(); i++) {
		if (ProductionMaster.rows[i].NUMBER_BILLET_TREE_CUT == Billet_info.rows[0].NUMBER_BILLET_TREE_INPUT) {
			length += ProductionMaster.rows[i].PART_OF_BILLET_LENGTH_ACT;
		}
	}
	let Data_Time = me.LoadingData({
		strQuery: "select INPUT_DATE from PRODUCTION_BILLET_INFO where PR_KEY = " + Billet_info.rows[0].PR_KEY /* STRING [Required] */
	});

	let MaterialData = me.LoadingData({
		strQuery: "select MATERIAL_CODE, ALLOYS_ID from MD_MATERIALS where MATERIAL_CODE = '" + Things["CTA.Common.Categories.BilletHeating_ScanMSSQL500ms"].X1_4M1_A1P46 + "'"
	});

	let AlloyCode = " ";
	if (MaterialData.getRowCount() > 0) {
		let AlloyData = me.LoadingData({
			strQuery: "select ALLOYS_CODE from MD_ALLOYS where ALLOYS_ID = " + MaterialData.rows[0].ALLOYS_ID
		});
		if (AlloyData.getRowCount() > 0) {
			AlloyCode = AlloyData.rows[0].ALLOYS_CODE;
		}
	}


	Billet_info.rows[0].TO_WORK_ORDER_ID = DataTime.rows[0].INPUT_DATE;
	Billet_info.rows[0].TOTAL_DEFECTS_OF_BILLET = Billet_info.rows[0].BILLET_TREE_INPUT_LENGTH - length;
	// Billet_info.rows[0].MATERIAL_LOT_NUMBER = Billet_info.rows[0].MATERIAL_LOT_NUMBER + "," + WorkOrders.rows[0].WORK_ORDER_CODE + "," + (Quantity.getRowCount() > 0 ? Quantity.QUANTITY_2 +" mm," : "-") + MaterialData.rows[0].MATERIAL_CODE
	Billet_info.rows[0].MATERIAL_LOT_NUMBER = Billet_info.rows[0].MATERIAL_LOT_NUMBER + "," + WorkOrders.rows[0].WORK_ORDER_CODE + "," + "-," + (MaterialData.getRowCount() > 0 ? MaterialData.rows[0].MATERIAL_CODE : "-") + "," + AlloyCode;
	Billet_info.rows[0].UPDATED_BY = time
	DataList.AddRow(Billet_info.rows[0])
	result = DataList;
}
