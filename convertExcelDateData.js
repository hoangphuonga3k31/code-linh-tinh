let NewPOData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
	infoTableName: "InfoTable",
	dataShapeName: "AES.DataShape.Dynamic.PURCHASE_ORDER"
});

let UpdatingPOData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
	infoTableName: "InfoTable",
	dataShapeName: "AES.DataShape.Dynamic.PURCHASE_ORDER"
});

let InvalidUpdatingPOData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
	infoTableName: "InfoTable",
	dataShapeName: "AES.DataShape.Dynamic.PURCHASE_ORDER"
});

let AllImportedData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
	infoTableName: "InfoTable",
	dataShapeName: "AES.DataShape.Dynamic.PURCHASE_ORDER"
});

let AllImportedData1 = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
	infoTableName: "InfoTable",
	dataShapeName: "AES.DataShape.Dynamic.PURCHASE_ORDER"
});

try {
	let convertDateString = (dateString) => {
		try {
			let regex = /^(\d{2})\/(\d{2})\/(\d{4})$|^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
			if (!regex.test(dateString)) {
				if (typeof (dateString) == "number") {

				} else {
					throw "Định dạng ngày không hợp lệ!";
				}
			}
			var parts = dateString.split('/');
			var isoString;

			if (parts.length === 3) {
				isoString = new Date(parts[2], parts[1] - 1, parts[0]);
				isoString = isoString.toISOString();
			} else {
				isoString = dateString.replace(' ', 'T') + 'Z';
			}
			let checkReturnData = new Date(isoString.toString());
			return isoString.toString();
		} catch (err) {
			return err.toString();
		}
	};

	function convertToDate(dateString) {
		var parts = dateString.split('/');
		if (parts.length !== 3) {
			return null; // Trả về null nếu chuỗi không đúng định dạng
		}

		var day = parseInt(parts[0], 10);
		var month = parseInt(parts[1], 10) - 1; // Giá trị tháng trong Date() là từ 0 đến 11
		var year = parseInt(parts[2], 10);

		// Kiểm tra tính hợp lệ của ngày, tháng, năm
		if (isNaN(day) || isNaN(month) || isNaN(year)) {
			return null;
		}

		var dateObject = new Date(year, month, day);

		// Kiểm tra tính hợp lệ của đối tượng ngày
		if (
			dateObject.getFullYear() !== year ||
			dateObject.getMonth() !== month ||
			dateObject.getDate() !== day
		) {
			return null;
		}

		return dateObject;
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

	function checkDuplicateRecords(data) {
		let duplicateRecords = [];
		let seen = {};

		for (let i = 0; i < data.length; i++) {
			let record = data[i];
			let key = record.PALLET_ID + '-' + record.LOT_NUMBER;

			if (seen[key]) {
				duplicateRecords.push(record);
			} else {
				seen[key] = true;
			}
		}

		return duplicateRecords;
	}

	//check sheets
	if (!importedJsonData || Object.keys(importedJsonData).length === 0) {
		throw ("File không có dữ liệu!");
	}
	let fields = Object.keys(importedJsonData);
	if (fields.length <= 0) {
		throw ("File không có dữ liệu!");
	}
	if (!importedJsonData["CTA_ClaveAuto"]) {
		throw ("Không tìm thấy Sheet CTA_ClaveAuto!");
	}
	////////////////////////////////////////////////////////
	if (isDataForAging) {
		importedJsonData["CTA_ClaveAuto"].forEach(ChoHoaGiaRow => {
			if (Object.keys(ChoHoaGiaRow).length !== 0) {
				if (!ChoHoaGiaRow.PURCHASE_ORDER_CODE || ChoHoaGiaRow.PURCHASE_ORDER_CODE.replace(/\s/g, "").length == 0) {
					throw ("Có dòng thiếu dữ liệu Số YC!");
				} else if (!ChoHoaGiaRow.PO_DETAILS_PROD_CODE || ChoHoaGiaRow.PO_DETAILS_PROD_CODE.replace(/\s/g, "").length == 0) {
					throw ("Đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + " có dòng thiếu dữ liệu Code sản phẩm!");
				} else if (ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-").length < 3 || ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-").length > 4) {
					throw ("Đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + " có dòng chứa Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE + " không đúng định dạng Mã loại hàng - Sản phẩm gốc- Kích thước (- Màu sắc nếu có)")
				} else if (!ChoHoaGiaRow.ACTUAL_WEIGHT || !parseFloat(ChoHoaGiaRow.ACTUAL_WEIGHT) || parseFloat(ChoHoaGiaRow.ACTUAL_WEIGHT) < 0) {
					throw ("Đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + " với Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE + " có thông tin Khối lượng của 1 thanh không hợp lệ (" + ChoHoaGiaRow.ACTUAL_WEIGHT + ")!");
				} else if (!ChoHoaGiaRow.QUANTITY_INCOME || !parseInt(ChoHoaGiaRow.QUANTITY_INCOME) || ChoHoaGiaRow.QUANTITY_INCOME % 1 != 0 || ChoHoaGiaRow.QUANTITY_INCOME < 0) {
					throw ("Đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + " với Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE + " có thông tin Số lượng thanh không hợp lệ (" + ChoHoaGiaRow.QUANTITY_INCOME + ")!");
				} else if (ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-").length == 3 || ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-").length == 4) {
					if (ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-")[0].length == 0) {
						throw ("Không có thông tin Mã loại hàng trong Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE);
					} else if (ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-")[1].length == 0) {
						throw ("Không có thông tin Sản phẩm gốc trong Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE);
					} else if (ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-")[2].length == 0) {
						throw ("Không có thông tin Kích thước trong Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE);
					} else if (!parseFloat(ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-")[2])) {
						throw ("Dữ liệu Kích thước trong Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE + " không đúng định dạng")
					}
					if (ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-").length == 4 && ChoHoaGiaRow.PO_DETAILS_PROD_CODE.split("-")[3].length == 0) {
						throw ("Không có thông tin Màu sắc trong Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE);
					}
				} else if (!ChoHoaGiaRow.PALLET_ID) {
					throw ("Đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + " với Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE + " thiếu dữ liệu Số giá!");
				} else if (!ChoHoaGiaRow.LOT_NUMBER || ChoHoaGiaRow.LOT_NUMBER.replace(/\s/g, "").length == 0) {
					throw ("Đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + " với Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE + " thiếu dữ liệu Lot Sản phẩm!");
				}
			}
		});
		// let checkDuplicatedData = checkDuplicateRecords(importedJsonData["CTA_ClaveAuto"]);
		// if (checkDuplicatedData.length > 0) {
		// 	let WarningString = "";
		// 	checkDuplicatedData.forEach(checkDuplicatedDataRow => {
		// 		WarningString += " " + checkDuplicatedDataRow.PURCHASE_ORDER_CODE + " ";
		// 	});
		// 	throw ("Đơn hàng " + WarningString + " chứa code sản phẩm trùng lặp");
		// }
	}
	//Thông tin PO
	let checkEmptyData = true;
	importedJsonData["CTA_ClaveAuto"].forEach(row => {
		if (Object.keys(row).length !== 0) {
			checkEmptyData = false;
			if (!row.PURCHASE_ORDER_CODE) {
				throw ("File chứa dòng không có dữ liệu Số YC!");
			}
			if (!row.PO_DETAILS_PROD_CODE) {
				throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + " chứa dòng không có dữ liệu Code sản phẩm!");
			}
			if (!row.PALLET_ID) {
				throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + " với Code sản phẩm " + row.PO_DETAILS_PROD_CODE + " chứa dòng không có dữ liệu Số giá!");
			}
			if (!row.LOT_NUMBER) {
				throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + " với Code sản phẩm " + row.PO_DETAILS_PROD_CODE + " và Số giá " + row.PALLET_ID + " không có dữ liệu Lot sản phẩm!");
			}
			if (!row.QUANTITY_INCOME) {
				throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + " với Code sản phẩm " + row.PO_DETAILS_PROD_CODE + ", Số giá " + row.PALLET_ID + " và Lot sản phẩm " + row.PALLET_ID + "\nkhông có dữ liệu Số lượng");
			}
			if (!row.ACTUAL_WEIGHT) {
				throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + " với Code sản phẩm " + row.PO_DETAILS_PROD_CODE + ", Số giá " + row.PALLET_ID + " và Lot sản phẩm " + row.PALLET_ID + "\nkhông có dữ liệu Khối lượng của 1 thanh!");
			}
		}
		if (checkEmptyData) {
			throw ("File không có dữ liệu!");
		}
	});

	let currentDatetime = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].GetdateTime();
	let currentDatetimeToString = currentDatetime.getFullYear().toString() + "-" + (parseInt(currentDatetime.getMonth()) + 1).toString().padStart(2, '0') + "-" + currentDatetime.getDate().toString().padStart(2, '0') + " " + currentDatetime.getHours().toString().padStart(2, '0') + ":" + currentDatetime.getMinutes().toString().padStart(2, '0') + ":" + currentDatetime.getSeconds().toString().padStart(2, '0');


	if (importedJsonData) {

		// Things["CTA.Business.MD.Customer"].ValidateDataFromJSON({
		// 	JsonData: importedJsonData /* JSON */
		// });

		Things["CTA.Business.Categories.Md_Colors"].ValidateDataFromJSONForAging({
			JsonData: importedJsonData /* JSON */
		});
		//		Things["CTA.Business.MD.Unit"].ValidateDataFromJSON1({
		//			JsonData: importedJsonData /* JSON */
		//		});
		// Things["CTA.Business.MD.Alloys"].ValidateDataFromJSON1({
		// 	JsonData: importedJsonData /* JSON */
		// });
		Things["CTA.Business.MD.ProductType"].ValidateDataFromJSONForAging({
			JsonData: importedJsonData /* JSON */
		});
		Things["CTA.Business.Categories.MD_PRODUCT"].ValidateDataFromJSONForAging({
			JsonData: importedJsonData /* JSON */
		});


		//dữ liệu chủa sheet Thông tin PO
		let importedPOData = importedJsonData["CTA_ClaveAuto"];
		let j = 0;
		let lastestPOID = me.Get_Pr_Key({
			tableName: me.TableName /* STRING */
		});
		if (importedPOData) {
			importedPOData.forEach(row => {
				if (Object.keys(row).length !== 0) {
					let CustomerDataString;
					let CustomerData = me.LoadingData({
						strQuery: "select * from MD_CUSTOMER where CUSTOMER_CODE = 'cta'"
					});
					if (CustomerData.getRowCount() > 0) {
						CustomerDataString = CustomerData.rows[0].CUSTOMER_ID;
					} else {
						let CustomerData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
							infoTableName: "InfoTable",
							dataShapeName: "AES.DataShape.Dynamic.MD_CUSTOMER"
						});
						let newPRKEY = Things["CTA.Business.MD.Customer"].MasterDataGetLastestID();
						let newEntry = {
							CUSTOMER_ID: newPRKEY,
							CUSTOMER_CODE: "CTA", // STRING
							CUSTOMER_NAME: "CTA", // STRING
							DESCRIPTION: "Tạo tự động từ Import lệnh hóa già", // STRING
							IS_ACTIVE: 1, // BOOLEAN
							USER_ID: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
						};
						CustomerData.AddRow(newEntry);
						Things["CTA.Business.MD.Customer"].NewImportedData = CustomerData;
						Things["CTA.Business.MD.Customer"].NewImportedData = ToTalImportedCustomerData;

						// Things["CTA.Business.MD.Customer"].SetExecuteData({
						// 	Data: CustomerData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.MD_CUSTOMER"} */,
						// 	Flag: "ADD" /* STRING */
						// });
						CustomerDataString = newPRKEY;
					}
					let newEntry = {
						PURCHASE_ORDER_CODE: row.PURCHASE_ORDER_CODE,
						STATUS: '2',
						PRIORITY: row.PRIORITY == 1 ? 1 : 0,
						CUSTOMER_ID: CustomerDataString,
						STARTED_DATE_PLAN: convertDateString(currentDatetimeToString),
						FINISHED_DATE_PLAN: convertDateString(currentDatetimeToString),
						STARTED_DATE_ACTUAL: convertDateString(currentDatetimeToString),
						FINISHED_DATE_ACTUAL: convertDateString(currentDatetimeToString),
						DESCRIPTION: row.DESCRIPTION ? row.DESCRIPTION : " ",
						IS_ACTIVE: 1,
						CREATED_DATE: convertDateString(currentDatetimeToString),
						CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(),
						UPDATED_DATE: convertDateString(currentDatetimeToString),
						UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser()
					};

					// let filterDataForChecking = me.FilterDataTable({
					// 	Condition: undefined /* STRING */,
					// 	isServer: undefined /* BOOLEAN [Required] {"defaultValue":false} */,
					// 	fieldName: "PURCHASE_ORDER_CODE" /* STRING [Required] */,
					// 	valueField: row.PURCHASE_ORDER_CODE /* STRING */
					// });
					let filterDataForChecking = me.LoadingData({
						strQuery: "select * from PURCHASE_ORDER where PURCHASE_ORDER_CODE = '" + row.PURCHASE_ORDER_CODE + "'"
					})
					if (filterDataForChecking.getRowCount() <= 0) {
						newEntry.PR_KEY = me.Generate_PrKey();
						newEntry.STATUS = 2;
						j++;
						NewPOData.AddRow(newEntry);
						AllImportedData.AddRow(newEntry);
					} else {
						if (filterDataForChecking.rows[0].STATUS == '0' || filterDataForChecking.rows[0].STATUS == '1') {
							filterDataForChecking.rows[0].STATUS = '1';
							filterDataForChecking.rows[0].UPDATED_DATE = convertDateString(currentDatetimeToString);
							filterDataForChecking.rows[0].UPDATED_BY = Resources["CurrentSessionInfo"].GetCurrentUser()
							UpdatingPOData.AddRow(filterDataForChecking.rows[0]);
							AllImportedData.AddRow(filterDataForChecking.rows[0]);
						} else if (filterDataForChecking.rows[0].STATUS == '2' || filterDataForChecking.rows[0].STATUS == '3') {
							filterDataForChecking.rows[0].UPDATED_DATE = convertDateString(currentDatetimeToString);
							filterDataForChecking.rows[0].UPDATED_BY = Resources["CurrentSessionInfo"].GetCurrentUser()
							UpdatingPOData.AddRow(filterDataForChecking.rows[0]);
							AllImportedData.AddRow(filterDataForChecking.rows[0]);
						} else if (filterDataForChecking.rows[0].STATUS == '4') {
							newEntry.PR_KEY = me.Generate_PrKey();
							newEntry.STATUS = 2;
							j++;
							NewPOData.AddRow(newEntry);
							AllImportedData.AddRow(newEntry);
						}
					}
				}
			});
		} else {
			throw ("File không có dữ liệu!");
		}
	} else {
		throw ("File không có dữ liệu!");
	}

	if (NewPOData.rows.length > 1) {
		function sorter(a, b) {
			return a - b;
		}

		for (let i = NewPOData.rows.length - 1; i > 0; i--) {
			if (NewPOData.rows[i].PR_KEY == NewPOData.rows[i - 1].PR_KEY) {
				NewPOData.RemoveRow(i);
			}
		}
		for (let j = 0; j < NewPOData.rows.length; j++) {
			for (let i = NewPOData.rows.length - 1; i >= 0; i--) {
				if (i > j && NewPOData.rows[i].PURCHASE_ORDER_CODE == NewPOData.rows[j].PURCHASE_ORDER_CODE) {
					NewPOData.RemoveRow(i);
				}
			}
		}
	}

	if (UpdatingPOData.rows.length > 1) {
		for (let i = UpdatingPOData.rows.length - 1; i > 0; i--) {
			if (UpdatingPOData.rows[i].PR_KEY == UpdatingPOData.rows[i - 1].PR_KEY) {
				UpdatingPOData.RemoveRow(i);
			}
		}
		for (let j = 0; j < UpdatingPOData.rows.length; j++) {
			for (let i = UpdatingPOData.rows.length - 1; i >= 0; i--) {
				if (i > j && UpdatingPOData.rows[i].PURCHASE_ORDER_CODE == UpdatingPOData.rows[j].PURCHASE_ORDER_CODE) {
					UpdatingPOData.RemoveRow(i);
				}
			}
		}
	}

	NewPOData.rows.forEach(dataRow => {
		AllImportedData1.AddRow(dataRow)
	});
	UpdatingPOData.rows.forEach(dataRow => {
		AllImportedData1.AddRow(dataRow)
	});

	NewPOData.rows.forEach(NewPORow => {
		NewPORow.STATUS = '2';
	});
	me.NewImportedDataForAging = NewPOData;
	me.UpdatingImportedDataForAging = UpdatingPOData;
	me.AllImportedDataForAging = AllImportedData1;

	let checkImportedPODetail = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].ValidateImportedDataForAging({
		importedJsonData: importedJsonData /* JSON */,
		isDataForAging: true
	});
	if (checkImportedPODetail != "OK") {
		throw (checkImportedPODetail);
	}

	result = "OK";
} catch (err) {
	result = err.toString();
}