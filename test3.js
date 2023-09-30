let finalResult = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
	infoTableName: "InfoTable",
	dataShapeName: "AES.DataShape.Dynamic.WHM_MATERIAL_VOUCHER_DETAILS",
});

// let Material = me.LoadingData({
// 	strQuery: "select top 1 * from WHM_MATERIAL_VOUCHER where VOUCHER_TYPE = 'OUT' order by PR_KEY desc"
// });

let Material = me.LoadingData({
	strQuery: "select top 1 * from PRODUCTION_BILLET_MASTER where STATUS != 'C' order by PR_KEY desc",
});

if (Material.getRowCount() > 0) {
	let Material_detail = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
		infoTableName: "InfoTable",
		dataShapeName: "AES.DataShape.Dynamic.WHM_MATERIAL_VOUCHER_DETAILS",
	});

	let VoucherDetailPR = -1;
	let VoucherDetailFR = -1;

	if (Material.rows[0].WHM_MATERIAL_VOUCHER_ID != -1) {
		VoucherDetailFR = Material.rows[0].WHM_MATERIAL_VOUCHER_ID
		let VoucherDetailData = me.LoadingData({
			strQuery: "select * from WHM_MATERIAL_VOUCHER_DETAILS where FR_KEY = " + Material.rows[0].WHM_MATERIAL_VOUCHER_ID
		});
		if (VoucherDetailData.getRowCount() > 0) {
			VoucherDetailPR = VoucherDetailData.rows[0].PR_KEY
		}
	}

	let WO_Data = me.LoadingData({
		strQuery: "select PR_KEY, WORK_ORDER_CODE from WORK_ORDERS where WORK_ORDER_TYPE = 'W_DEP' and STATUS = 2"
	});

	let CodeBillet = "-";
	let AlloyCode = "-";
	let AlloyName = "-";
	MATERIAL_DIAMETER_ID = " ";

	if (Material.rows[0].MATERIAL_ID != -1) {
		let materialData = me.LoadingData({
			strQuery: "select MATERIAL_CODE, ALLOYS_ID, MATERIAL_DIAMETER_ID from MD_MATERIALS where MATERIAL_ID = " + Material.rows[0].MATERIAL_ID
		});
		if (materialData.getRowCount() > 0) {
			CodeBillet = materialData.rows[0].MATERIAL_CODE;
			MATERIAL_DIAMETER_ID = materialData.rows[0].MATERIAL_DIAMETER_ID;
			if (materialData.rows[0].ALLOYS_ID != -1) {
				let AlloyData = me.LoadingData({
					strQuery: "select ALLOYS_CODE, ALLOYS_NAME from MD_ALLOYS where ALLOYS_ID = " + materialData.rows[0].ALLOYS_ID
				});
				if (AlloyData.getRowCount() > 0) {
					AlloyCode = AlloyData.rows[0].ALLOYS_CODE;
					AlloyName = AlloyData.rows[0].ALLOYS_NAME;

				}
			}
		}
	}

	let UnitID = -1;
	let MATERIAL_LENGTH = 0;
	let ACTUAL_WEIGHT = 0;
	let QUANTITY = 0;
	let WO_CODE = WO_Data.rows[0].WORK_ORDER_CODE;
	let LotBillet = Material.rows[0].MATERIAL_LOT_NUMBER;

	let Material_Voucher_Details = me.LoadingData({
		strQuery: "select top 1 * from WHM_MATERIAL_VOUCHER_DETAILS where FR_KEY = " + Material.rows[0].WHM_MATERIAL_VOUCHER_ID,
	});
	let WHM_Material_Master_Data = me.LoadingData({
		strQuery: "select UNIT_ID, MATERIAL_LENGTH, ACTUAL_WEIGHT, QUANTITY_OUTCOME from WHM_MATERIAL_MASTER where LOT_NUMBER = '" + Material.rows[0].MATERIAL_LOT_NUMBER + "'"
	});

	if (WHM_Material_Master_Data.getRowCount() > 0) {
		UnitID = WHM_Material_Master_Data.rows[0].UNIT_ID;
		MATERIAL_LENGTH = WHM_Material_Master_Data.rows[0].MATERIAL_LENGTH;
		ACTUAL_WEIGHT = WHM_Material_Master_Data.rows[0].ACTUAL_WEIGHT;
		QUANTITY = WHM_Material_Master_Data.rows[0].QUANTITY;
	}


	// AES.DataShape.Dynamic.WHM_MATERIAL_VOUCHER_DETAILS entry object
	let newEntry = {
		PR_KEY: VoucherDetailPR,
		FR_KEY: VoucherDetailFR,
		WORK_ORDER_ID: WO_Data.rows[0].PR_KEY, // NUMBER
		MATERIAL_ID: Material.rows[0].MATERIAL_ID, // INTEGER
		LOT_NUMBER: LotBillet + "," + WO_CODE + "," + AlloyCode + "," + AlloyName + "," + CodeBillet, // STRING
		QUANTITY: Material_Voucher_Details.getRowCount() > 0 ? Material_Voucher_Details.rows[0].QUANTITY : QUANTITY, // NUMBER
		UNIT_ID: Material_Voucher_Details.getRowCount() > 0 ? Material_Voucher_Details.rows[0].UNIT_ID : UnitID, // INTEGER
		RAW_WEIGHT: Material_Voucher_Details.getRowCount() > 0 ? Material_Voucher_Details.rows[0].RAW_WEIGHT : ACTUAL_WEIGHT, // NUMBER
		ACTUAL_WEIGHT: Material_Voucher_Details.getRowCount() > 0 ? Material_Voucher_Details.rows[0].ACTUAL_WEIGHT : ACTUAL_WEIGHT, // NUMBER
		MATERIAL_LENGTH: Material_Voucher_Details.getRowCount() > 0 ? Material_Voucher_Details.rows[0].MATERIAL_LENGTH : MATERIAL_LENGTH, // NUMBER
		QRCODE: Material_Voucher_Details.getRowCount() > 0 ? Material_Voucher_Details.rows[0].QRCODE : " ", // STRING
		PRODUCTION_DATE: Material_Voucher_Details.getRowCount() > 0 ? Material_Voucher_Details.rows[0].PRODUCTION_DATE : new Date(), // DATETIME
		MATERIAL_DIAMETER_ID: Material_Voucher_Details.getRowCount() > 0 ? Material_Voucher_Details.rows[0].MATERIAL_DIAMETER_ID : MATERIAL_DIAMETER_ID // STRING
	};
	Material_detail.AddRow(newEntry);

	let a = 0;
	for (let i = 0; i < 9; i++) {
		let dataTagString = "X1_4M1_A1P0" + i;
		if (Things["CTA.Common.Categories.BilletHeating_ScanMSSQL500ms"][dataTagString] != "                                ") {
			a++;
		}
	}

	finalResult = Material_detail;
}

result = finalResult;
