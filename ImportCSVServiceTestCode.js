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

try {
	let convertDateString = (dateString) => {
		try {
			if (typeof (dateString) == "number") {
				let dateData = new Date(Math.round((dateString - 25569) * 86400 * 1000));
				let dateStringData = dateData.getFullYear().toString() + "-" + (dateData.getMonth() + 1).toString().padStart(2, "0") + dateData.getDate().toString().padStart(2, "0") + "T" + dateData.getHours().toString().padStart(2, "0") + ":" + dateData.getMinutes().toString().padStart(2, "0") + ":" + dateData.getSeconds().toString().padStart(2, "0") + "Z";
				return dateStringData;
			} else {
				let regex = /^(\d{2})\/(\d{2})\/(\d{4})$|^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
				if (!regex.test(dateString)) {
					throw "Định dạng ngày không hợp lệ!";
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
			}
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
			let key = record.PURCHASE_ORDER_CODE + '-' + record.PO_DETAILS_PROD_CODE;

			if (seen[key]) {
				duplicateRecords.push(record);
			} else {
				seen[key] = true;
			}
		}

		return duplicateRecords;
	}

	//check file structure
	//check sheets
	if (!importedJsonData || Object.keys(importedJsonData).length === 0) {
		throw ("File không có dữ liệu!");
	}
	let fields = Object.keys(importedJsonData);
	if (fields.length <= 0) {
		throw ("File không có dữ liệu!");
	}
	if (!importedJsonData["Thông tin PO"] || !importedJsonData["Thông tin PO"].length) {
		throw ("File không có dữ liệu Đơn hàng!");
	}
	if (!importedJsonData["Chi tiết PO"] || !importedJsonData["Chi tiết PO"].length) {
		throw ("File không có dữ liệu Chi tiết đơn hàng!");
	}
	////////////////////////////////////////////////////////
	if (isDataForAging) {
		if (!importedJsonData["DS Chờ Hóa già"] || !importedJsonData["DS Chờ Hóa già"].length) {
			throw ("File không có dữ liệu DS Chờ Hóa già!");
		} else {
			importedJsonData["DS Chờ Hóa già"].forEach(ChoHoaGiaRow => {
				if (Object.keys(ChoHoaGiaRow).length !== 0) {
					if (!ChoHoaGiaRow.PURCHASE_ORDER_CODE || ChoHoaGiaRow.PURCHASE_ORDER_CODE.replace(/\s/g, "").length == 0) {
						throw ("Sheet DS Chờ Hóa già có dòng thiếu dữ liệu Số YC!");
					} else if (!ChoHoaGiaRow.PO_DETAILS_PROD_CODE || ChoHoaGiaRow.PO_DETAILS_PROD_CODE.replace(/\s/g, "").length == 0) {
						throw ("Sheet DS Chờ Hóa già, đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + " có dòng thiếu dữ liệu Code sản phẩm!");
					} else if (!ChoHoaGiaRow.PALLET_ID || parseInt(ChoHoaGiaRow.PALLET_ID) < 1) {
						throw ("Sheet DS Chờ Hóa già, đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + ", Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE + " chứa dữ liệu Số giá không hợp lệ!");
					} else if (!ChoHoaGiaRow.PRODUCT_LOT_NUMBER || ChoHoaGiaRow.PRODUCT_LOT_NUMBER.replace(/\s/g, "").length == 0) {
						throw ("Sheet DS Chờ Hóa già, đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + ", Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE + " thiếu dữ liệu Lot Sản phẩm!");
					} else if (!ChoHoaGiaRow.TOTAL_ALUMINUM_BAR || parseInt(ChoHoaGiaRow.TOTAL_ALUMINUM_BAR) < 1) {
						throw ("Sheet DS Chờ Hóa già, đơn hàng " + ChoHoaGiaRow.PURCHASE_ORDER_CODE + ", Code sản phẩm " + ChoHoaGiaRow.PO_DETAILS_PROD_CODE + " chứa dữ liệu Số lượng thanh không hợp lệ!");
					}
				}
			});
			let checkDuplicatedData = checkDuplicateRecords(importedJsonData["DS Chờ Hóa già"]);
			if (checkDuplicatedData.length > 0) {
				let WarningString = "";
				checkDuplicatedData.forEach(checkDuplicatedDataRow => {
					WarningString += " " + checkDuplicatedDataRow.PURCHASE_ORDER_CODE;
				});
				throw ("Sheet DS Chờ Hóa già, Số YC" + WarningString + " chứa code sản phẩm trùng lặp");
			}
		}
	}
	////////////////////////////////////////////////////////
	if (!importedJsonData["MD Sản phẩm"]) {
		throw ("File không có dữ liệu Sản phẩm!");
	}
	if (!importedJsonData["MD Loại sản phẩm"]) {
		throw ("File không có dữ liệu Loại sản phẩm!");
	}
	if (!importedJsonData["MD Hợp kim"]) {
		throw ("File không có dữ liệu Hợp kim!");
	}
	if (!importedJsonData["MD Đơn vị tính"]) {
		throw ("File không có dữ liệu Đơn vị tính!");
	}
	if (!importedJsonData["MD Màu sắc"]) {
		throw ("File không có dữ liệu Màu sắc!");
	}
	if (!importedJsonData["MD Khách hàng"]) {
		throw ("File không có dữ liệu Khách hàng!");
	}

	//check data in sheet
	if (checkDuplicateCode(importedJsonData, "Thông tin PO", "PURCHASE_ORDER_CODE")) {
		throw ("Sheet Thông tin PO có chứa Số YC trùng lặp");
	}
	//	if (checkDuplicateCode(importedJsonData, "Chi tiết PO", "PO_DETAILS_PROD_CODE")) {
	//		throw ("Sheet Chi tiết PO có chứa Code sản phẩm trùng lặp")
	//	}
	if (checkDuplicateCode(importedJsonData, "MD Sản phẩm", "PRODUCT_CODE")) {
		throw ("Sheet MD Sản phẩm có chứa Mã sản phẩm trùng lặp");
	}
	if (checkDuplicateCode(importedJsonData, "MD Loại sản phẩm", "PRODUCT_TYPE_CODE")) {
		throw ("Sheet MD Loại sản phẩm có chứa Mã loại sản phẩm trùng lặp");
	}
	if (checkDuplicateCode(importedJsonData, "MD Hợp kim", "ALLOYS_CODE")) {
		throw ("Sheet MD Hợp kim có chứa Mã hợp kim trùng lặp");
	}
	if (checkDuplicateCode(importedJsonData, "MD Đơn vị tính", "UNIT_CODE")) {
		throw ("Sheet MD Đơn vị tính có chứa Mã đơn vị tính trùng lặp");
	}
	if (checkDuplicateCode(importedJsonData, "MD Màu sắc", "COLOR_CODE")) {
		throw ("Sheet MD Màu sắc có chứa Mã màu trùng lặp");
	}
	if (checkDuplicateCode(importedJsonData, "MD Khách hàng", "CUSTOMER_CODE")) {
		throw ("Sheet MD Khách hàng có chứa Mã khách hàng trùng lặp");
	}

	//Thông tin PO
	let checkEmptyData = true;
	let checkCode =
		importedJsonData["Thông tin PO"].forEach(row => {
			if (Object.keys(row).length !== 0) {
				checkEmptyData = false;
				if (!row.PURCHASE_ORDER_CODE) {
					throw ("Sheet thông tin đơn hàng không có dữ liệu Số YC!");
				}
				if (!row.CUSTOMER_CODE) {
					throw ("Sheet thông tin đơn hàng không có dữ liệu Mã khách hàng!");
				}
				if (!row.STARTED_DATE_PLAN) {
					throw ("Sheet thông tin đơn hàng không có dữ liệu Ngày bắt đầu sản xuất dự kiến!");
				}
				if (!row.FINISHED_DATE_PLAN) {
					throw ("Sheet thông tin đơn hàng không có dữ liệu Ngày kết thúc sản xuất dự kiến!");
				}
			}
			if (checkEmptyData) {
				throw ("Sheet thông tin đơn hàng không có dữ liệu!");
			}
		})
	//Chi tiết PO
	checkEmptyData = true;
	importedJsonData["Chi tiết PO"].forEach(row => {
		if (Object.keys(row).length !== 0) {
			checkEmptyData = false;
			if (!row.PURCHASE_ORDER_CODE) {
				throw ("Sheet chi tiết đơn hàng không có dữ liệu Số YC!");
			}
			if (!row.PRODUCT_CODE) {
				throw ("Sheet chi tiết đơn hàng không có dữ liệu Mã sản phẩm!");
			}
			if (!row.PO_DETAILS_PROD_CODE) {
				throw ("Sheet chi tiết đơn hàng không có dữ liệu Code sản phẩm!");
			}
			if (!row.COLOR_CODE) {
				throw ("Sheet chi tiết đơn hàng không có dữ liệu Mã màu!");
			}
			if (!row.ALLOYS_CODE) {
				throw ("Sheet chi tiết đơn hàng không có dữ liệu Mã hợp kim!");
			}
			if (!row.UNIT_CODE) {
				throw ("Sheet chi tiết đơn hàng không có dữ liệu Mã đơn vị tính!");
			}
			if (!row.QUANTITY) {
				throw ("Sheet chi tiết đơn hàng không có dữ liệu Số lượng thanh!");
			}
			if (!row.PRODUCT_SIZE) {
				throw ("Sheet chi tiết đơn hàng không có dữ liệu Kích thước!");
			}
			if (!row.PRODUCT_PROPORTION) {
				throw ("Sheet chi tiết đơn hàng không có dữ liệu Tỷ trọng!");
			}
		}
		if (checkEmptyData) {
			throw ("Sheet chi tiết đơn hàng không có dữ liệu!");
		}
	})
	//MD Sản phẩm
	checkEmptyData = true;
	importedJsonData["MD Sản phẩm"].forEach(row => {
		if (Object.keys(row).length !== 0) {
			checkEmptyData = false;
			if (!row.PRODUCT_CODE) {
				throw ("Sheet MD Sản phẩm không có dữ liệu Mã sản phẩm!");
			}
			if (!row.PRODUCT_NAME) {
				throw ("Sheet MD Sản phẩm không có dữ liệu Tên sản phẩm!");
			}
			if (!row.PRODUCT_TYPE_CODE) {
				throw ("Sheet MD Sản phẩm không có dữ liệu Loại sản phẩm!");
			}
			if (!row.UNIT_CODE) {
				throw ("Sheet MD Sản phẩm không có dữ liệu Mã đơn vị tính!");
			}
		}
		if (checkEmptyData) {
			throw ("Sheet MD Sản phẩm không có dữ liệu!");
		}
	});
	//MD Loại sản phẩm
	checkEmptyData = true;
	importedJsonData["MD Loại sản phẩm"].forEach(row => {
		if (Object.keys(row).length !== 0) {
			checkEmptyData = false;
			if (!row.PRODUCT_TYPE_CODE) {
				throw ("Sheet MD Loại sản phẩm không có dữ liệu Mã loại sản phẩm!");
			}
			if (!row.PRODUCT_TYPE_NAME) {
				throw ("Sheet MD Loại sản phẩm không có dữ liệu Tên loại sản phẩm!");
			}
		}
		if (checkEmptyData) {
			throw ("Sheet MD Loại sản phẩm không có dữ liệu!");
		}
	})
	//MD Hợp kim
	checkEmptyData = true;
	importedJsonData["MD Hợp kim"].forEach(row => {
		if (Object.keys(row).length !== 0) {
			checkEmptyData = false;
			if (!row.ALLOYS_CODE) {
				throw ("Sheet MD Hợp kim không có dữ liệu Mã hợp kim!");
			}
			if (!row.ALLOYS_NAME) {
				throw ("Sheet MD Hợp kim không có dữ liệu Tên hợp kim!");
			}
		}
		if (checkEmptyData) {
			throw ("Sheet MD Hợp kim không có dữ liệu!");
		}
	})
	//MD Đơn vị tính
	checkEmptyData = true;
	importedJsonData["MD Đơn vị tính"].forEach(row => {
		if (Object.keys(row).length !== 0) {
			checkEmptyData = false;
			if (!row.UNIT_CODE) {
				throw ("Sheet MD Đơn vị tính không có dữ liệu Mã đơn vị tính!");
			}
			if (!row.UNIT_NAME) {
				throw ("Sheet MD Đơn vị tính không có dữ liệu Tên đơn vị tính!");
			}
		}
		if (checkEmptyData) {
			throw ("Sheet MD Đơn vị tính không có dữ liệu!");
		}
	});
	//MD Màu sắc
	checkEmptyData = true;
	importedJsonData["MD Màu sắc"].forEach(row => {
		if (Object.keys(row).length !== 0) {
			checkEmptyData = false;
			if (!row.COLOR_CODE) {
				throw ("Sheet MD Màu sắc không có dữ liệu Mã màu!");
			}
			if (!row.COLOR_NAME) {
				throw ("Sheet MD Màu sắc không có dữ liệu Tên màu!");
			}
		}
		if (checkEmptyData) {
			throw ("Sheet MD Màu sắc không có dữ liệu!");
		}
	})
	//MD Khách hàng
	checkEmptyData = true;
	importedJsonData["MD Khách hàng"].forEach(row => {
		if (Object.keys(row).length !== 0) {
			checkEmptyData = false;
			if (!row.CUSTOMER_CODE) {
				throw ("Sheet MD Khách hàng không có dữ liệu Mã khách hàng!");
			}
			if (!row.CUSTOMER_NAME) {
				throw ("Sheet MD Khách hàng không có dữ liệu Tên khách hàng!");
			}
		}
		if (checkEmptyData) {
			throw ("Sheet MD Khách hàng không có dữ liệu!");
		}
	});



	let currentDatetime = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].GetdateTime();
	let currentDatetimeToString = currentDatetime.getFullYear().toString() + "-" + (parseInt(currentDatetime.getMonth()) + 1).toString().padStart(2, '0') + "-" + currentDatetime.getDate().toString().padStart(2, '0') + " " + currentDatetime.getHours().toString().padStart(2, '0') + ":" + currentDatetime.getMinutes().toString().padStart(2, '0') + ":" + currentDatetime.getSeconds().toString().padStart(2, '0');

	let lastestCode = me.getLastestPOCode();

	if (importedJsonData) {

		Things["CTA.Business.MD.Customer"].ValidateDataFromJSON({
			JsonData: importedJsonData /* JSON */
		});


		//dữ liệu chủa sheet Thông tin PO
		let importedPOData = importedJsonData["Thông tin PO"];
		let j = 0;
		let lastestPOID = me.Get_Pr_Key({
			tableName: me.TableName /* STRING */
		});
		if (importedPOData) {
			importedPOData.forEach(row => {
				if (Object.keys(row).length !== 0) {
					if (!row.PURCHASE_ORDER_CODE || row.PURCHASE_ORDER_CODE.replace(/\s/g, "").length == 0) {
						throw ("Sheet Thông tin PO có dòng thiếu dữ liệu Số YC!");
					} else if (!row.CUSTOMER_CODE || row.CUSTOMER_CODE.replace(/\s/g, "").length == 0) {
						throw ("Sheet Thông tin PO, đơn hàng " + row.PURCHASE_ORDER_CODE + " có dòng thiếu dữ liệu Mã khách hàng!");
					} else if (!row.STARTED_DATE_PLAN || typeof (row.STARTED_DATE_PLAN) == "number" ? !convertDateString(row.STARTED_DATE_PLAN) : row.STARTED_DATE_PLAN.replace(/\s/g, "").length == 0) {
						throw ("Sheet Thông tin PO, đơn hàng " + row.PURCHASE_ORDER_CODE + " có dòng thiếu dữ liệu Ngày bắt đầu sản xuất dự kiến!");
					} else if (!row.FINISHED_DATE_PLAN || typeof (row.FINISHED_DATE_PLAN) == "number" ? !convertDateString(row.FINISHED_DATE_PLAN) : row.FINISHED_DATE_PLAN.replace(/\s/g, "").length == 0) {
						throw ("Sheet Thông tin PO, đơn hàng " + row.PURCHASE_ORDER_CODE + " có dòng thiếu dữ liệu Ngày kết thúc sản xuất dự kiến!");
					}
					let CustomerData = Things["CTA.Business.MD.Customer"].FilterDataTable({
						Condition: undefined /* STRING */,
						isServer: undefined /* BOOLEAN [Required] {"defaultValue":false} */,
						fieldName: "CUSTOMER_CODE" /* STRING [Required] */,
						valueField: row.CUSTOMER_CODE /* STRING */
					});
					let CustomerID;
					if (CustomerData.getRowCount() > 0) {
						CustomerID = CustomerData.rows[0].CUSTOMER_ID;
					} else {
						let NewCustomerData = Things["CTA.Business.MD.Customer"].FilterImportingData({
							fieldName: "CUSTOMER_CODE" /* STRING [Required] */,
							valueField: row.CUSTOMER_CODE /* STRING */
						});
						if (NewCustomerData.getRowCount() > 0) {
							CustomerID = NewCustomerData.rows[0].CUSTOMER_ID;
						} else {
							throw ("Không tìm thấy mã khách hàng " + row.CUSTOMER_CODE + "!")
						}
					}

					if (convertDateString(row.STARTED_DATE_PLAN) == "Định dạng ngày không hợp lệ!") {
						throw ("File chứa thông tin Ngày bắt đầu dự kiến không đúng định dạng!");
					}
					if (convertDateString(row.FINISHED_DATE_PLAN) == "Định dạng ngày không hợp lệ!") {
						throw ("File chứa thông tin Ngày kết thúc dự kiến không đúng định dạng!");
					}
					if (convertDateString(row.STARTED_DATE_PLAN) > convertDateString(row.FINISHED_DATE_PLAN)) {
						throw ("Sheet Thông tin PO, đơn hàng " + row.PURCHASE_ORDER_CODE + "\ncó ngày bắt đầu dự kiến lớn hơn ngày kết thúc dự kiến!");
					} else if (convertDateString(row.STARTED_DATE_PLAN) == convertDateString(row.FINISHED_DATE_PLAN)) {
						throw ("Sheet Thông tin PO, đơn hàng " + row.PURCHASE_ORDER_CODE + "\ncó ngày bắt đầu dự kiến bằng ngày kết thúc dự kiến!");
					}

					let newEntry = {
						PURCHASE_ORDER_CODE: row.PURCHASE_ORDER_CODE,
						STATUS: '0',
						PRIORITY: row.PRIORITY == 1 ? 1 : 0,
						CUSTOMER_ID: CustomerID ? CustomerID : null,
						STARTED_DATE_PLAN: convertDateString(row.STARTED_DATE_PLAN),
						FINISHED_DATE_PLAN: convertDateString(row.FINISHED_DATE_PLAN),
						STARTED_DATE_ACTUAL: convertDateString(row.STARTED_DATE_PLAN),
						FINISHED_DATE_ACTUAL: convertDateString(row.FINISHED_DATE_PLAN),
						DESCRIPTION: row.DESCRIPTION ? row.DESCRIPTION : " ",
						IS_ACTIVE: 1,
						CREATED_DATE: convertDateString(currentDatetimeToString),
						CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(),
						UPDATED_DATE: convertDateString(currentDatetimeToString),
						UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser()
					};
					let filterDataForChecking = me.LoadingData({
						strQuery: "select * from PURCHASE_ORDER where PURCHASE_ORDER_CODE = '" + row.PURCHASE_ORDER_CODE + "'"
					})
					// let filterDataForChecking = me.FilterDataTable({
					// 	Condition: undefined /* STRING */,
					// 	isServer: undefined /* BOOLEAN [Required] {"defaultValue":false} */,
					// 	fieldName: "PURCHASE_ORDER_CODE" /* STRING [Required] */,
					// 	valueField: row.PURCHASE_ORDER_CODE /* STRING */
					// });
					if (filterDataForChecking.getRowCount() <= 0) {
						if (!isDataForAging) {
							if (convertDateString(row.STARTED_DATE_PLAN) < convertDateString(row.FINISHED_DATE_PLAN)) {
								newEntry.PR_KEY = lastestPOID.rows[0].PR_KEY + j;
								j++;
								NewPOData.AddRow(newEntry);
								AllImportedData.AddRow(newEntry);
							} else {
								throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + ", ngày bắt đầu dự kiến lớn hơn ngày kết thúc dự kiến");
							}
						} else {
							if (convertDateString(row.STARTED_DATE_PLAN) < convertDateString(row.FINISHED_DATE_PLAN)) {
								newEntry.PR_KEY = lastestPOID.rows[0].PR_KEY + j;
								newEntry.STATUS = 2;
								j++;
								NewPOData.AddRow(newEntry);
								AllImportedData.AddRow(newEntry);
							} else {
								throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + ", ngày bắt đầu dự kiến lớn hơn ngày kết thúc dự kiến");
							}
						}

					} else {
						if (!isDataForAging) {
							//check status của đơn, chỉ status New mới được sửa
							if (filterDataForChecking.rows[0].STATUS == '0') {
								let filterDataForCheckingPODetail = me.LoadingData({
									strQuery: "select * from PURCHASE_ORDER where FR_KEY = " + filterDataForChecking.rows[0].PR_KEY
								})
								// let filterDataForCheckingPODetail = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].FilterDataTable({
								// 	Condition: undefined /* STRING */,
								// 	isServer: undefined /* BOOLEAN [Required] {"defaultValue":false} */,
								// 	fieldName: "FR_KEY" /* STRING [Required] */,
								// 	valueField: filterDataForChecking.rows[0].PR_KEY /* STRING */
								// });
								if (filterDataForCheckingPODetail.getRowCount() <= 0) {
									//if (row.STARTED_DATE_PLAN >= filterDataForChecking.rows[0].CREATED_DATE && row.STARTED_DATE_PLAN < row.FINISHED_DATE_PLAN) {
									if (convertDateString(row.STARTED_DATE_PLAN) < convertDateString(row.FINISHED_DATE_PLAN)) {

										newEntry.PR_KEY = filterDataForChecking.rows[0].PR_KEY;
										newEntry.CREATED_DATE = filterDataForChecking.rows[0].CREATED_DATE;
										newEntry.STARTED_DATE_ACTUAL = filterDataForChecking.rows[0].STARTED_DATE_ACTUAL;
										newEntry.FINISHED_DATE_ACTUAL = convertDateString(filterDataForChecking.rows[0].FINISHED_DATE_ACTUAL);
										UpdatingPOData.AddRow(newEntry);
										AllImportedData.AddRow(newEntry);
									} else {
										throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + ", ngày bắt đầu dự kiến lớn hơn ngày kết thúc dự kiến");
									}
								} else {
									filterDataForCheckingPODetail.rows.toArray().forEach(detailRows => {
										let checkWOData = Things["CTA.Business.Production.Dm_WorkOrders"].FilterDataTable({
											Condition: undefined /* STRING */,
											isServer: undefined /* BOOLEAN [Required] {"defaultValue":false} */,
											fieldName: "FR_KEY" /* STRING [Required] */,
											valueField: detailRows.PR_KEY /* STRING */
										});
										if (checkWOData.getRowCount() <= 0) {
											//if (row.STARTED_DATE_PLAN >= filterDataForChecking.rows[0].CREATED_DATE && row.STARTED_DATE_PLAN < row.FINISHED_DATE_PLAN) {
											if (convertDateString(row.STARTED_DATE_PLAN) < convertDateString(row.FINISHED_DATE_PLAN)) {
												newEntry.PR_KEY = filterDataForChecking.rows[0].PR_KEY;
												newEntry.CREATED_DATE = filterDataForChecking.rows[0].CREATED_DATE;
												newEntry.STARTED_DATE_ACTUAL = filterDataForChecking.rows[0].STARTED_DATE_ACTUAL;
												newEntry.FINISHED_DATE_ACTUAL = convertDateString(filterDataForChecking.rows[0].FINISHED_DATE_ACTUAL);
												UpdatingPOData.AddRow(newEntry);
												AllImportedData.AddRow(newEntry);
											} else {
												throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + ", ngày bắt đầu dự kiến lớn hơn ngày kết thúc dự kiến");
											}
										} else {
											throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + " đã có lệnh sản xuất");
										}
									});
								}
							} else {
								throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + " không ở trạng thái 'New'");
							}
						} else {
							if (convertDateString(row.STARTED_DATE_PLAN) < convertDateString(row.FINISHED_DATE_PLAN)) {

								newEntry.PR_KEY = filterDataForChecking.rows[0].PR_KEY;
								newEntry.CREATED_DATE = filterDataForChecking.rows[0].CREATED_DATE;
								newEntry.STARTED_DATE_ACTUAL = filterDataForChecking.rows[0].STARTED_DATE_ACTUAL;
								newEntry.FINISHED_DATE_ACTUAL = convertDateString(filterDataForChecking.rows[0].FINISHED_DATE_ACTUAL);
								UpdatingPOData.AddRow(newEntry);
								AllImportedData.AddRow(newEntry);
							} else {
								throw ("Đơn hàng " + row.PURCHASE_ORDER_CODE + ", ngày bắt đầu dự kiến lớn hơn ngày kết thúc dự kiến");
							}
						}

					}
				}
			});
		} else {
			throw ("File không có dữ liệu Đơn hàng!");
		}
	} else {
		throw ("File không có dữ liệu!");
	}

	for (let i = NewPOData.rows.length - 1; i > 0; i--) {
		if (NewPOData.rows[i].PR_KEY == NewPOData.rows[i - 1].PR_KEY) {
			NewPOData.RemoveRow(i);
		}
	}
	for (let i = UpdatingPOData.rows.length - 1; i > 0; i--) {
		if (UpdatingPOData.rows[i].PR_KEY == UpdatingPOData.rows[i - 1].PR_KEY) {
			UpdatingPOData.RemoveRow(i);
		}
	}
	for (let i = AllImportedData.rows.length - 1; i > 0; i--) {
		if (AllImportedData.rows[i].PR_KEY == AllImportedData.rows[i - 1].PR_KEY) {
			AllImportedData.RemoveRow(i);
		}
	}

	if (!isDataForAging) {
		me.NewImportedData = NewPOData;
		me.UpdatingImportedData = UpdatingPOData;
		me.AllImportedData = AllImportedData;

		let checkImportedPODetail = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].ValidateImportedData({
			importedJsonData: importedJsonData /* JSON */,
			isDataForAging: false
		});
		if (checkImportedPODetail != "OK") {
			throw (checkImportedPODetail);
		}
	} else {
		NewPOData.rows.forEach(NewPORow => {
			NewPORow.STATUS = '2';
		});
		me.NewImportedDataForAging = NewPOData;
		me.UpdatingImportedDataForAging = UpdatingPOData;
		me.AllImportedDataForAging = AllImportedData;

		let checkImportedPODetail = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].ValidateImportedData({
			importedJsonData: importedJsonData /* JSON */,
			isDataForAging: true
		});
		if (checkImportedPODetail != "OK") {
			throw (checkImportedPODetail);
		}
	}
	result = "OK";
} catch (err) {
	result = err.toString();
}