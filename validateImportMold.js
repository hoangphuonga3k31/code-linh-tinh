me.ImportedMoldMasterData.RemoveAllRows();
me.MoldMasterDataNew.RemoveAllRows();
me.MoldMasterDataOld.RemoveAllRows();
Things["CTA.Business.Categories.Md_Molds"].ClearDataExecute();
Things["CTA.Business.Categories.Md_Molds"].UpdatingImportedData.RemoveAllRows();
Things["CTA.Business.Categories.Md_Molds_Group"].ClearDataExecute();
Things["CTA.Business.MD.Unit"].ClearDataExecute();

me.errorFromImportString = "OK";

let errorData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
	infoTableName: "InfoTable",
	dataShapeName: "AES.DataShape.Manual.TIME_RANGE"
});

// function checkMoldStatus(statusCode) {
// 	let statusData = statusCode.toString().toLowerCase();
// 	switch (statusData) {
// 		case 'khuôn chờ thử':
// 			return '00';
// 		case 'khuôn tốt':
// 			return '10';
// 		case 'khuôn chờ xuất':
// 			return '20';
// 		case 'khuôn đang bảo hành':
// 			return '30';
// 		case 'khuôn đang sửa':
// 			return '40';
// 		case 'khuôn NCC sửa':
// 			return '50';
// 		case 'khuôn đang sản xuất':
// 			return '60';
// 		case 'khuôn hủy':
// 			return '70';
// 		case 'khuôn chờ ủ':
// 			return '61';
// 		case 'khuôn đang gia nhiệt':
// 			return '62';
// 		case 'khuôn sang máy đùn ép':
// 			return '63';
// 		default:
// 			return '';
// 	}
// }
try {
	let convertDateString = (dateString) => {
		var parts = dateString.split('/');
		var isoString;

		if (parts.length === 3) {
			isoString = new Date(parts[2], parts[1] - 1, parts[0])
			isoString = isoString.toISOString();
		} else {
			isoString = dateString.replace(' ', 'T') + 'Z';
		}
		return isoString.toString();
	}

	function checkDuplicateCode(data, sheetName, keyName) {
		try {
			let purchaseOrders = data[sheetName];

			const codes = [];
			for (let i = 0; i < purchaseOrders.length; i++) {
				let code = purchaseOrders[i][keyName];
				if (code && codes.indexOf(code) !== -1) {
					return true;
				}
				codes.push(code);
			}
			return false;
		} catch (error) {
			return false;
		}
	}

	function convertStringToMoldStatus(stringData) {
		if (stringData) {
			switch (stringData.toString().trim().toUpperCase()) {
				// case "ĐANG SỬ DỤNG":
				// case "KHUÔN THỬ OK":
				// case "KHUÔN VƯỢT TỶ TRỌNG":
				// case "KHUÔN VƯỢT TỈ TRỌNG":
				//     return '10';
				//     break;
				case "KHUÔN ĐANG ĐẶT":
				case "KHUÔN THAY ĐỔI THIẾT KẾ":
				case "NCC:XUẤT SỬA MỚI":
				case "NCC:XUẤT SỬA CŨ":
					return "00";
				case "XUẤT SỬA NỘI BỘ":
					return "30";
				case "XUẤT SỬA MỚI":
				case "XUẤT SỬA CŨ":
					return "50";
				default:
					return "10";
			}
		} else {
			return "10";
		}
	}
	let MD_Mold_ID = Things["CTA.Business.Categories.Md_Molds"].GetID() + 1;
	let MD_Unit_ID = Things["CTA.Business.MD.Alloys"].GetLastestID();
	let currentDatetime = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].GetdateTime();
	let currentDatetimeToString = currentDatetime.getFullYear().toString() + "-" + (parseInt(currentDatetime.getMonth()) + 1).toString().padStart(2, '0') + "-" + currentDatetime.getDate().toString().padStart(2, '0') + " " + currentDatetime.getHours().toString().padStart(2, '0') + ":" + currentDatetime.getMinutes().toString().padStart(2, '0') + ":" + currentDatetime.getSeconds().toString().padStart(2, '0')
	// if (checkDuplicateCode(DataJson, "MD Khuôn", "MOLD_CODE")) {
	// 	throw ("Sheet Khuôn có chứa mã khuôn trùng lặp")
	// }

	//    let i = 0;
	let ID = 0;
	let ID_UNIT = 0;
	if (DataJson) {
		if (!DataJson["MD Khuôn"]) {
			throw ("Không tìm thấy sheet MD Khuôn");
		}
		let MoldData = DataJson["MD Khuôn"];
		let MD_Mold_ID_2 = Things["CTA.Business.Categories.Md_Molds"].GetID() + 1;
		if (MoldData.length > 0) {
			let i = 2;
			let j = 0;
			MoldData.forEach(row => {
				i++;
				if (Object.keys(row).length !== 0 && row.MOLD_CODE.toString().trim().length > 0 && row.MOLD_CODE.toString().trim().length > 0) {
					let newEntry = {
						KEY: undefined, // STRING
						VALUE: undefined // STRING
					};

					let isDataValid = true;
					let errorString = "Dòng " + i;
					if (!row.MOLD_CODE) {
						throw ("Dòng " + i + " không có dữ liệu mã khuôn!")
						errorString += " không có dữ liệu mã khuôn";
						isDataValid = false;
					}
					if (!row.MOLD_GROUP_ID) {
						throw ("Dòng " + i + " không có dữ liệu mã nhóm khuôn!")
					}
					if (!row.ERP_MOLD_CODE) {
						throw ("Dòng " + i + " không có dữ liệu mã khuôn theo hệ thống ERP!")
					}
					if (!row.NUMBER_OF_CROSS_SECTIONS && row.NUMBER_OF_CROSS_SECTIONS != 0) {
						throw ("Dòng " + i + " không có dữ liệu số mặt cắt!")
					}
					if (typeof (row.NUMBER_OF_CROSS_SECTIONS) != "number" || row.NUMBER_OF_CROSS_SECTIONS < 0 || row.NUMBER_OF_CROSS_SECTIONS % 1 != 0) {
						throw ("Dòng " + i + " có dữ liệu số mặt cắt không hợp lệ!")
					}
					if (!row.DESIGN_RATIO && row.DESIGN_RATIO != 0) {
						throw ("Dòng " + i + " không có dữ liệu tỷ trọng thiết kế!")
					}
					if (typeof (row.DESIGN_RATIO) != "number" || row.DESIGN_RATIO < 0) {
						throw ("Dòng " + i + " có dữ liệu tỷ trọng thiết kế không hợp lệ!")
					}
					if (!row.ACTUAL_RATIO && row.ACTUAL_RATIO != 0) {
						throw ("Dòng " + i + " không có dữ liệu tỷ trọng thực tế!")
					}
					if (typeof (row.ACTUAL_RATIO) != "number" || row.ACTUAL_RATIO < 0) {
						throw ("Dòng " + i + " có dữ liệu tỷ trọng thực tế không hợp lệ!")
					}
					// if (!row.MIN_DEPRECIATION) {
					// 	throw ("Dòng " + i + " không có dữ liệu khấu hao tối thiểu!")
					// }
					if (row.MIN_DEPRECIATION && ((typeof (row.MIN_DEPRECIATION) != "number" && row.MIN_DEPRECIATION.toString().trim().toUpperCase() != "NULL") || row.MIN_DEPRECIATION < 0)) {
						throw ("Dòng " + i + " có dữ liệu khấu hao tối thiểu không hợp lệ!")
					}
					if (!row.UNIT_CODE) {
						throw ("Dòng " + i + " không có dữ liệu mã đơn vị tính!")
					}
					if (!row.STATUS && row.STATUS != 0) {
						throw ("Dòng " + i + " không có dữ liệu trạng thái khuôn!")
					}

					let dataForMold = Things["CTA.Business.Warehouse.WHM_Mold_Master"].MoldMasterDataNew;
					// let paramsForMold = {
					// 	fieldName: "UPDATED_BY" /* STRING */,
					// 	data: dataForMold /* INFOTABLE */,
					// 	fieldValue: row.MOLD_CODE
					// };

					let paramsForMold = {
						fieldName: "UPDATED_BY" /* STRING */,
						isCaseSensitive: false /* BOOLEAN {"defaultValue":false} */,
						t: dataForMold /* INFOTABLE */,
						value: row.MOLD_CODE.toString().trim() /* STRING */
					};
					// let foundRoundForMold = Resources["PTC.Factory.CommonUtilities"].FindRowNumber(paramsForMold);
					let foundRoundForMold = Resources["InfoTableFunctions"].EQFilter(paramsForMold);

					let paramsForExistedMoldERP = {
						fieldName: "CREATED_BY" /* STRING */,
						isCaseSensitive: false /* BOOLEAN {"defaultValue":false} */,
						t: Things["CTA.Business.Warehouse.WHM_Mold_Master"].ImportedMoldMasterData /* INFOTABLE */,
						value: row.ERP_MOLD_CODE.toString().trim() /* STRING */
					};
					// let foundRound = Resources["PTC.Factory.CommonUtilities"].FindRowNumber(params);
					let foundRoundForExistedMoldERP = Resources["InfoTableFunctions"].EQFilter(paramsForExistedMoldERP);

					if (foundRoundForMold.getRowCount() == 0) {

						// Insert nhóm khuôn mới
						let dataMoldGroup = me.LoadingData({
							strQuery: "SELECT * FROM MD_MOLD_GROUP WHERE MOLD_GROUP_ID = '" + row.MOLD_GROUP_ID.toString().trim() + "'"
						});
						if (dataMoldGroup.getRowCount() == 0) {
							// let params = {
							// 	fieldName: "MOLD_GROUP_ID" /* STRING */,
							// 	data: Things["CTA.Business.Categories.Md_Molds_Group"].DataTable_Execute /* INFOTABLE */,
							// 	fieldValue: row.MOLD_GROUP_ID /* STRING */
							// };
							let params = {
								fieldName: "MOLD_GROUP_ID" /* STRING */,
								isCaseSensitive: false /* BOOLEAN {"defaultValue":false} */,
								t: Things["CTA.Business.Categories.Md_Molds_Group"].DataTable_Execute /* INFOTABLE */,
								value: row.MOLD_GROUP_ID.toString().trim() /* STRING */
							};
							// let foundRound = Resources["PTC.Factory.CommonUtilities"].FindRowNumber(params);
							let foundRound = Resources["InfoTableFunctions"].EQFilter(params);

							if (foundRound.getRowCount() == 0) {
								let NewMoldGroup = Things["CTA.Business.Categories.Md_Molds_Group"].GetEmptyDataTable();
								NewMoldGroup.MOLD_GROUP_ID = row.MOLD_GROUP_ID.toString().trim();
								NewMoldGroup.MOLD_GROUP_NAME = row.MOLD_GROUP_ID.toString().trim();
								NewMoldGroup.ACTIVE = 1;
								NewMoldGroup.USER_ID = Resources["CurrentSessionInfo"].GetCurrentUser();
								Things["CTA.Business.Categories.Md_Molds_Group"].DataTable_Execute.AddRow(NewMoldGroup.rows[0])
							}
						}
						// Insert đơn vị tính mới
						let dataUnit = me.LoadingData({
							strQuery: "SELECT * FROM MD_UNIT WHERE UNIT_CODE = '" + row.UNIT_CODE.toString().trim() + "'"
						});
						let UnitIDData;
						if (dataUnit.getRowCount() == 0) {
							// let params = {
							// 	fieldName: "UNIT_CODE" /* STRING */,
							// 	data: Things["CTA.Business.MD.Unit"].DataTable_Execute /* INFOTABLE */,
							// 	fieldValue: row.UNIT_CODE /* STRING */
							// };
							let params = {
								fieldName: "UNIT_CODE" /* STRING */,
								isCaseSensitive: false /* BOOLEAN {"defaultValue":false} */,
								t: Things["CTA.Business.MD.Unit"].DataTable_Execute /* INFOTABLE */,
								value: row.UNIT_CODE.toString().trim() /* STRING */
							};
							// let foundRound = Resources["PTC.Factory.CommonUtilities"].FindRowNumber(params);
							let foundRound = Resources["InfoTableFunctions"].EQFilter(params);

							if (foundRound.getRowCount() == 0) {
								UnitIDData = Things["CTA.Business.MD.Unit"].MasterDataGetLastestID() + ID_UNIT;
								let NewUnit = Things["CTA.Business.MD.Unit"].GetEmptyDataTable();
								NewUnit.UNIT_ID = UnitIDData;
								NewUnit.UNIT_CODE = typeof (row.UNIT_CODE) == "number" ? (row.UNIT_CODE % 1 != 0 ? row.UNIT_CODE : row.UNIT_CODE.toFixed(0)) : row.UNIT_CODE;
								NewUnit.UNIT_NAME = typeof (row.UNIT_CODE) == "number" ? (row.UNIT_CODE % 1 != 0 ? row.UNIT_CODE : row.UNIT_CODE.toFixed(0)) : row.UNIT_CODE;
								NewUnit.DESCRIPTION = " ";
								NewUnit.IS_ACTIVE = 1;
								NewUnit.USER_ID = Resources["CurrentSessionInfo"].GetCurrentUser();
								Things["CTA.Business.MD.Unit"].DataTable_Execute.AddRow(NewUnit.rows[0])
								ID_UNIT++
							} else {
								UnitIDData = foundRound.rows[0].UNIT_ID;
							}
						} else {
							UnitIDData = dataUnit.rows[0].UNIT_ID;
						}
						// Insert khuôn mới
						let dataMold = me.LoadingData({
							strQuery: "SELECT * FROM MD_MOLDS WHERE MOLD_CODE  = '" + row.MOLD_CODE.toString().trim() + "'"
						});

						let dataMoldERP = me.LoadingData({
							strQuery: "SELECT * FROM MD_MOLDS WHERE ERP_MOLD_CODE  = '" + row.ERP_MOLD_CODE.toString().trim() + "'"
						});

						// Insert kho khuôn
						if (dataMold.getRowCount() > 0 && dataMoldERP.getRowCount() > 0) {


							let DataMoldMaster = me.LoadingData({
								strQuery: "SELECT * FROM WHM_MOLD_MASTER WHERE MOLD_ID = " + dataMold.MOLD_ID
							})
							// check khuôn master
							if (DataMoldMaster.getRowCount() > 0) {
								// check trạng thái khuôn master
								if (DataMoldMaster.rows[0].STATUS != '10' && DataMoldMaster.rows[0].STATUS != '20' && DataMoldMaster.rows[0].STATUS != '60' && DataMoldMaster.rows[0].STATUS != '61' && DataMoldMaster.rows[0].STATUS != '62' && DataMoldMaster.rows[0].STATUS != '63') {
									let paramsForExistedMold = {
										fieldName: "UPDATED_BY" /* STRING */,
										isCaseSensitive: false /* BOOLEAN {"defaultValue":false} */,
										t: Things["CTA.Business.Warehouse.WHM_Mold_Master"].ImportedMoldMasterData /* INFOTABLE */,
										value: row.MOLD_CODE.toString().trim() /* STRING */
									};
									// let foundRound = Resources["PTC.Factory.CommonUtilities"].FindRowNumber(params);
									let foundRoundForExistedMold = Resources["InfoTableFunctions"].EQFilter(paramsForExistedMold);

									let paramsForExistedMoldERP = {
										fieldName: "CREATED_BY" /* STRING */,
										isCaseSensitive: false /* BOOLEAN {"defaultValue":false} */,
										t: Things["CTA.Business.Warehouse.WHM_Mold_Master"].ImportedMoldMasterData /* INFOTABLE */,
										value: row.ERP_MOLD_CODE.toString().trim() /* STRING */
									};
									// let foundRound = Resources["PTC.Factory.CommonUtilities"].FindRowNumber(params);
									let foundRoundForExistedMoldERP = Resources["InfoTableFunctions"].EQFilter(paramsForExistedMoldERP);

									if (foundRoundForExistedMold.getRowCount() == 0 && foundRoundForExistedMoldERP.getRowCount() == 0) {

										if (dataMold.rows[0].NUMBER_OF_CROSS_SECTIONS == row.NUMBER_OF_CROSS_SECTIONS && //số mặt cắt
											dataMold.rows[0].DESIGN_RATIO == row.DESIGN_RATIO && //tỷ trọng thiết kế
											dataMold.rows[0].MOLD_GROUP_ID == row.MOLD_GROUP_ID &&
											DataMoldMaster.rows[0].ACTUAL_RATIO == row.ACTUAL_RATIO && //tỷ trọng thực tế
											DataMoldMaster.rows[0].MIN_DEPRECIATION == ((row.MIN_DEPRECIATION && row.MIN_DEPRECIATION.toString().trim().toUpperCase() != "NULL") ? row.MIN_DEPRECIATION : 0) &&
											DataMoldMaster.rows[0].UNIT_ID == UnitIDData &&
											DataMoldMaster.rows[0].STATUS == convertStringToMoldStatus(row.STATUS)
										) {
											let zzz = 0;
										} else {
											if (dataMold.rows[0].MOLD_CODE == row.MOLD_CODE.toString().trim() && dataMold.rows[0].ERP_MOLD_CODE == row.ERP_MOLD_CODE.toString().trim()) {
												DataMoldMaster.rows[0].MIN_DEPRECIATION = (row.MIN_DEPRECIATION && row.MIN_DEPRECIATION.toString().trim().toUpperCase() != "NULL") ? row.MIN_DEPRECIATION : 0;
												DataMoldMaster.rows[0].ACTUAL_RATIO = row.ACTUAL_RATIO
												DataMoldMaster.rows[0].UNIT_ID = UnitIDData
												DataMoldMaster.rows[0].ITEM_GROUP_ID = row.MOLD_GROUP_ID
												DataMoldMaster.rows[0].UPDATED_BY = row.MOLD_CODE.toString().trim()
												DataMoldMaster.rows[0].CREATED_BY = row.ERP_MOLD_CODE.toString().trim()
												DataMoldMaster.rows[0].STATUS = convertStringToMoldStatus(row.STATUS)
												me.ImportedMoldMasterData.AddRow(DataMoldMaster.rows[0])

												dataMold.rows[0].NUMBER_OF_CROSS_SECTIONS = row.NUMBER_OF_CROSS_SECTIONS;
												dataMold.rows[0].DESIGN_RATIO = row.DESIGN_RATIO;
												Things["CTA.Business.Categories.Md_Molds"].UpdatingImportedData.AddRow(dataMold.rows[0])
											}
										}
									}

									// DataMoldMaster.rows[0].MIN_DEPRECIATION = row.MIN_DEPRECIATION ? row.MIN_DEPRECIATION : 0;
									// DataMoldMaster.rows[0].ACTUAL_RATIO = row.ACTUAL_RATIO
									// DataMoldMaster.rows[0].STATUS = parseInt(row.STATUS) == 0 ? '00' : parseInt(row.STATUS) == 0 ? '00' : row.STATUS.toString().substring(0, 2)
									// me.ImportedMoldMasterData.AddRow(DataMoldMaster.rows[0])
									// if (dataMold.getRowCount() == 0) {
									// 	let NewMold = Things["CTA.Business.Categories.Md_Molds"].GetEmptyDataTable();
									// 	NewMold.MOLD_ID = MD_Mold_ID_2 + j;
									// 	NewMold.MOLD_GROUP_ID = row.MOLD_GROUP_ID.toString().trim();
									// 	NewMold.MOLD_CODE = row.MOLD_CODE.toString().trim();
									// 	NewMold.ERP_MOLD_CODE = row.ERP_MOLD_CODE.toString().trim();
									// 	NewMold.MOLD_NAME = row.MOLD_CODE.toString().trim();
									// 	NewMold.DESIGN_RATIO = row.DESIGN_RATIO;
									// 	NewMold.NUMBER_OF_CROSS_SECTIONS = row.NUMBER_OF_CROSS_SECTIONS;
									// 	NewMold.ACTIVE = 1;
									// 	NewMold.USER_ID = Resources["CurrentSessionInfo"].GetCurrentUser();
									// 	Things["CTA.Business.Categories.Md_Molds"].DataTable_Execute.AddRow(NewMold.rows[0])
									// 	j++;
									// } else {
									// 	dataMold.rows[0].NUMBER_OF_CROSS_SECTIONS = row.NUMBER_OF_CROSS_SECTIONS;
									// 	dataMold.rows[0].DESIGN_RATIO = row.DESIGN_RATIO;
									// 	Things["CTA.Business.Categories.Md_Molds"].UpdatingImportedData.AddRow(dataMold.rows[0])
									// }

								} else {
									// throw ("Khuôn " + row.MOLD_CODE.toString().trim() + " đã tồn tại và thuộc trạng thái khuôn không thể chỉnh sửa");
									// me.ImportedMoldMasterData.AddRow(DataMoldMaster.rows[0])
								}
							} else if (dataUnit.getRowCount() > 0 && dataMoldERP.getRowCount() == 0 && dataMold.getRowCount() == 0) {
								let NewMoldData = me.GetEmptyDataTable();
								NewMoldData.WAREHOUSE_ID = "KHO-KHUON";
								NewMoldData.ITEM_GROUP_ID = DataMold.rows[0].MOLD_GROUP_ID.toString().trim()
								NewMoldData.MOLD_ID = DataMold.rows[0].MOLD_ID;
								NewMoldData.STATUS = convertStringToMoldStatus(row.STATUS)
								NewMoldData.QUANTITY_INCOME = 1
								NewMoldData.QUANTITY_OUTCOME = 0.001
								NewMoldData.ACTUAL_RATIO = row.ACTUAL_RATIO
								NewMoldData.MIN_DEPRECIATION = (row.MIN_DEPRECIATION && row.MIN_DEPRECIATION.toString().trim().toUpperCase() != "NULL") ? row.MIN_DEPRECIATION : 0;
								NewMoldData.UNIT_ID = dataUnit.rows[0].UNIT_ID
								NewMoldData.PRODUCTION_WEIGHT = 0.001
								NewMoldData.NUMBER_OF_BILLET = 0.001
								NewMoldData.CREATED_DATE = convertDateString(currentDatetimeToString)
								NewMoldData.CREATED_BY = row.ERP_MOLD_CODE.toString().trim()
								NewMoldData.UPDATED_DATE = convertDateString(currentDatetimeToString)
								NewMoldData.UPDATED_BY = row.MOLD_CODE.toString().trim()

								me.MoldMasterDataNew.AddRow(NewMoldData.rows[0])
							} else {
								if (dataMoldERP.getRowCount() == 0 && dataMold.getRowCount() == 0) {
									let NewMoldData = me.GetEmptyDataTable();
									NewMoldData.WAREHOUSE_ID = "KHO-KHUON";
									NewMoldData.ITEM_GROUP_ID = DataMold.rows[0].MOLD_GROUP_ID.toString().trim()
									NewMoldData.MOLD_ID = DataMold.rows[0].MOLD_ID;
									NewMoldData.STATUS = convertStringToMoldStatus(row.STATUS)
									NewMoldData.QUANTITY_INCOME = 1
									NewMoldData.QUANTITY_OUTCOME = 0.001
									NewMoldData.ACTUAL_RATIO = row.ACTUAL_RATIO
									NewMoldData.MIN_DEPRECIATION = (row.MIN_DEPRECIATION && row.MIN_DEPRECIATION.toString().trim().toUpperCase() != "NULL") ? row.MIN_DEPRECIATION : 0;
									NewMoldData.UNIT_ID = UnitIDData;
									NewMoldData.PRODUCTION_WEIGHT = 0.001
									NewMoldData.NUMBER_OF_BILLET = 0.001
									NewMoldData.CREATED_DATE = convertDateString(currentDatetimeToString)
									NewMoldData.CREATED_BY = row.ERP_MOLD_CODE.toString().trim()
									NewMoldData.UPDATED_DATE = convertDateString(currentDatetimeToString)
									NewMoldData.UPDATED_BY = row.MOLD_CODE.toString().trim()

									me.MoldMasterDataNew.AddRow(NewMoldData.rows[0])
									ID_UNIT++;
								}
							}
						} else if (dataUnit.getRowCount() > 0 && dataMoldERP.getRowCount() == 0 && dataMold.getRowCount() == 0) {
							let NewMoldMasterData = me.GetEmptyDataTable();
							NewMoldMasterData.WAREHOUSE_ID = "KHO-KHUON";
							NewMoldMasterData.ITEM_GROUP_ID = row.MOLD_GROUP_ID.toString().trim()
							NewMoldMasterData.MOLD_ID = MD_Mold_ID + ID;
							NewMoldMasterData.STATUS = convertStringToMoldStatus(row.STATUS)
							NewMoldMasterData.QUANTITY_INCOME = 1
							NewMoldMasterData.QUANTITY_OUTCOME = 0.001
							NewMoldMasterData.ACTUAL_RATIO = row.ACTUAL_RATIO
							NewMoldMasterData.MIN_DEPRECIATION = (row.MIN_DEPRECIATION && row.MIN_DEPRECIATION.toString().trim().toUpperCase() != "NULL") ? row.MIN_DEPRECIATION : 0;
							NewMoldMasterData.UNIT_ID = dataUnit.rows[0].UNIT_ID;
							NewMoldMasterData.PRODUCTION_WEIGHT = 0.001
							NewMoldMasterData.NUMBER_OF_BILLET = 0.001
							NewMoldMasterData.CREATED_DATE = convertDateString(currentDatetimeToString)
							NewMoldMasterData.CREATED_BY = row.ERP_MOLD_CODE.toString().trim()
							NewMoldMasterData.UPDATED_DATE = convertDateString(currentDatetimeToString)
							NewMoldMasterData.UPDATED_BY = row.MOLD_CODE.toString().trim()

							me.MoldMasterDataNew.AddRow(NewMoldMasterData.rows[0])
							ID++;

							let NewMold = Things["CTA.Business.Categories.Md_Molds"].GetEmptyDataTable();
							NewMold.MOLD_ID = MD_Mold_ID_2 + j;
							NewMold.MOLD_GROUP_ID = row.MOLD_GROUP_ID.toString().trim();
							NewMold.MOLD_CODE = row.MOLD_CODE.toString().trim();
							NewMold.ERP_MOLD_CODE = row.ERP_MOLD_CODE.toString().trim();
							NewMold.MOLD_NAME = row.MOLD_CODE.toString().trim();
							NewMold.DESIGN_RATIO = row.DESIGN_RATIO;
							NewMold.NUMBER_OF_CROSS_SECTIONS = row.NUMBER_OF_CROSS_SECTIONS;
							NewMold.ACTIVE = 1;
							NewMold.USER_ID = Resources["CurrentSessionInfo"].GetCurrentUser();
							Things["CTA.Business.Categories.Md_Molds"].DataTable_Execute.AddRow(NewMold.rows[0]);
							j++;
						} else {
							if (dataMoldERP.getRowCount() == 0 && dataMold.getRowCount() == 0) {
								let NewMoldMasterData = me.GetEmptyDataTable();
								NewMoldMasterData.WAREHOUSE_ID = "KHO-KHUON";
								NewMoldMasterData.ITEM_GROUP_ID = row.MOLD_GROUP_ID.toString().trim();
								NewMoldMasterData.MOLD_ID = MD_Mold_ID + ID;
								NewMoldMasterData.STATUS = convertStringToMoldStatus(row.STATUS)
								NewMoldMasterData.QUANTITY_INCOME = 1;
								NewMoldMasterData.QUANTITY_OUTCOME = 0.001;
								NewMoldMasterData.ACTUAL_RATIO = row.ACTUAL_RATIO;
								NewMoldMasterData.MIN_DEPRECIATION = (row.MIN_DEPRECIATION && row.MIN_DEPRECIATION.toString().trim().toUpperCase() != "NULL") ? row.MIN_DEPRECIATION : 0;
								NewMoldMasterData.UNIT_ID = UnitIDData;
								NewMoldMasterData.PRODUCTION_WEIGHT = 0.001;
								NewMoldMasterData.NUMBER_OF_BILLET = 0.001;
								NewMoldMasterData.CREATED_DATE = convertDateString(currentDatetimeToString);
								NewMoldMasterData.CREATED_BY = row.ERP_MOLD_CODE.toString().trim()
								NewMoldMasterData.UPDATED_DATE = convertDateString(currentDatetimeToString);
								NewMoldMasterData.UPDATED_BY = row.MOLD_CODE.toString().trim();

								me.MoldMasterDataNew.AddRow(NewMoldMasterData.rows[0]);
								ID++;
								// ID_UNIT++;

								let NewMold = Things["CTA.Business.Categories.Md_Molds"].GetEmptyDataTable();
								NewMold.MOLD_ID = MD_Mold_ID_2 + j;
								NewMold.MOLD_GROUP_ID = row.MOLD_GROUP_ID.toString().trim();
								NewMold.MOLD_CODE = row.MOLD_CODE.toString().trim();
								NewMold.ERP_MOLD_CODE = row.ERP_MOLD_CODE.toString().trim();
								NewMold.MOLD_NAME = row.MOLD_CODE.toString().trim();
								NewMold.DESIGN_RATIO = row.DESIGN_RATIO;
								NewMold.NUMBER_OF_CROSS_SECTIONS = row.NUMBER_OF_CROSS_SECTIONS;
								NewMold.ACTIVE = 1;
								NewMold.USER_ID = Resources["CurrentSessionInfo"].GetCurrentUser();
								Things["CTA.Business.Categories.Md_Molds"].DataTable_Execute.AddRow(NewMold.rows[0]);
								j++;
							}
						}
					}
				}
			});
		} else {
			throw ("File không có dữ liệu!");
		}
	}
	result = 'OK';
} catch (err) {
	result = err.toString();
}