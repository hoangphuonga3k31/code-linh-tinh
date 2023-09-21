let finalResult = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.WHM_MATERIAL_VOUCHER_DETAILS"
});

// let Material = me.LoadingData({
// 	strQuery: "select top 1 * from WHM_MATERIAL_VOUCHER where VOUCHER_TYPE = 'OUT' order by PR_KEY desc"
// });

let Material = me.LoadingData({
	strQuery: "select top 1 * from PRODUCTION_BILLET_MASTER where STATUS != 'C' order by PR_KEY"
});

if(Material.getRowCount() > 0) {
	let Material_detail = me.LoadingData({
		strQuery: "select top 1 * from WHM_MATERIAL_VOUCHER_DETAILS where FR_KEY = " + Material.rows[0].WHM_MATERIAL_VOUCHER_ID
	});
	let quantitynew = Material_detail.rows[0].QUANTITY;
	
	let Material_detail_ver2 = me.LoadingData({
		strQuery: "select * from WHM_MATERIAL_VOUCHER_DETAILS where WORK_ORDER_ID = " + Material_detail.rows[0].WORK_ORDER_ID
	});
	let quantity_ver2 = 0;
	
	for (let i = 0; i < Material_detail_ver2.getRowCount(); i++) {
		quantity_ver2 += Material_detail_ver2.rows[i].QUANTITY;
	};
	Material_detail.rows[0].QUANTITY = quantity_ver2;
	
	let BilletInfo = me.LoadingData({
		strQuery: "select * from PRODUCTION_BILLET_INFO where WORK_ORDER_ID = " + Material_detail.rows[0].WORK_ORDER_ID
	});
	Material_detail.rows[0].QUANTITY = Material_detail.rows[0].QUANTITY - BilletInfo.getRowCount();
	
	let WorkOrders = me.LoadingData({
		strQuery: "select * from WORK_ORDERS where PR_KEY = " + Material_detail.rows[0].WORK_ORDER_ID
	});
	
	let Materials = me.LoadingData({
		strQuery: "select * from MD_MATERIALS where MATERIAL_ID = " + Material_detail.rows[0].MATERIAL_ID
	});
	
	let Alloys = me.LoadingData({
		strQuery: "select * from MD_ALLOYS where ALLOYS_ID = " + Materials.rows[0].ALLOYS_ID
	});
	let DataLotBillet = Material_detail.rows[0].LOT_NUMBER.toString().padEnd(14, " ");
	
	Material_detail.rows[0].LOT_NUMBER = (Material_detail.getRowCount() > 0 ? Material_detail.rows[0].LOT_NUMBER : "-") + "," + 
										 (WorkOrders.getRowCount() > 0 ? WorkOrders.rows[0].WORK_ORDER_CODE : "-") + "," +
										 (Alloys.getRowCount() > 0 ? Alloys.rows[0].ALLOYS_CODE : "-") + "," + 
										 (Alloys.getRowCount() > 0 ? Alloys.rows[0].ALLOYS_NAME : "-") + "," + 
										 (Materials.getRowCount() > 0 ? Materials.rows[0].MATERIAL_CODE : "-")
	let a = 0;
	for (let i = 0; i < 9; i++) {
		let dataTagString = "X1_4M1_A1P0" + i;
		if (Things["CTA.Common.Categories.BilletHeating_ScanMSSQL500ms"][dataTagString] != "                                ") {
			a++;
		}
	};

	finalResult = Material_detail
}


result = finalResult;