try {
    let convertDateString = (dateString) => {
        var parts = dateString.split('/');
        var isoString;

        if (parts.toString().length === 3) {
            isoString = new Date(parts[2], parts[1] - 1, parts[0]);
            isoString = isoString.toISOString();
        } else {
            isoString = dateString.replace(' ', 'T') + 'Z';
        }
        return isoString.toString();
    };

    let NewPODetailData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Dynamic.PURCHASE_ORDER_DETAILS"
    });

    let UpdatingPODetailData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Dynamic.PURCHASE_ORDER_DETAILS"
    });

    let InvalidUpdatingPODetailData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Dynamic.PURCHASE_ORDER_DETAILS"
    });

    let WorkOrderDataForAgingImporting = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Dynamic.WORK_ORDERS"
    });

    let DataForImportHGToShow = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Manual.PRODUCTION_MASTER_DETAIL_FOR_WAITING_HG"
    });

    let DataToImportDataInto_PRODUCTION_MASTER_DETAIL = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER_DETAIL"
    });

    let DataForImporting_WHM_PRODUCT_MASTER = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Dynamic.WHM_PRODUCT_MASTER"
    });

    let DataForImporting_WHM_PRODUCT_VOUCHER = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Dynamic.WHM_PRODUCT_VOUCHER"
    });

    let DataForImporting_PRODUCTION_MASTER = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
        infoTableName: "InfoTable",
        dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_MASTER"
    });

    let currentDatetime = me.GetdateTime();
    let currentDatetimeToString = currentDatetime.getFullYear().toString() + "-" + (parseInt(currentDatetime.getMonth()) + 1).toString().padStart(2, '0') + "-" + currentDatetime.getDate().toString().padStart(2, '0') + " " + currentDatetime.getHours().toString().padStart(2, '0') + ":" + currentDatetime.getMinutes().toString().padStart(2, '0') + ":" + currentDatetime.getSeconds().toString().padStart(2, '0');
    let WarehouseData = me.LoadingData({
        strQuery: "select WAREHOUSE_ID from MD_WAREHOUSES where WAREHOUSE_TYPE_ID = 'PROD'" /* STRING [Required] */
    });

    let cur = me.GetdateTime();
    let startTime = new Date(cur);
    startTime.setDate(cur.getDate() - 1);
    startTime.setHours(0, 0, 0);
    let yesterdayDatetimeToString = startTime.getFullYear().toString() + "-" + (parseInt(startTime.getMonth()) + 1).toString().padStart(2, '0') + "-" + startTime.getDate().toString().padStart(2, '0') + " " + startTime.getHours().toString().padStart(2, '0') + ":" + startTime.getMinutes().toString().padStart(2, '0') + ":" + startTime.getSeconds().toString().padStart(2, '0');

    if (importedJsonData) {
        let checkImportedProduct = Things["CTA.Business.Categories.MD_PRODUCT"].ValidateDataFromJSONForWHM({
            JsonData: importedJsonData /* JSON */
        });
        if (checkImportedProduct != "OK") {
            throw (checkImportedProduct);
        }
        // if (isDataForAging) {
        // 	Things["CTA.Business.Categories.MD_Pallet"].ValidateDataFromJSON({
        // 		JsonData: importedJsonData /* JSON */
        // 	});
        // }
        let checkPallet = Things["CTA.Business.Categories.MD_Pallet"].ValidateDataFromJSONCopyForWHM({
            JsonData: importedJsonData /* JSON */
        });
        if (checkPallet != "OK") {
            throw (checkPallet);
        }

        let importedPODetailData = importedJsonData["CTA_Paint"];
        let i = 0;
        let lastestPOID = me.Get_Pr_Key({
            tableName: me.TableName /* STRING */
        });
        if (importedPODetailData && importedPODetailData.toString().length > 0) {
            let i = 0; //index cho đơn hàng
            let lastestID = me.Get_Pr_Key({
                tableName: me.TableName /* STRING */
            });

            importedPODetailData.forEach(row => {
                if (Object.keys(row).length !== 0) {
                    let POIDData;
                    let ImportedPOData = Things["CTA.Business.Product.PO.PurchaseOrder"].AllImportedDataForAging;

                    let paramsForCheckPOKey = {
                        fieldName: "PURCHASE_ORDER_CODE" /* STRING */,
                        isCaseSensitive: false /* BOOLEAN {"defaultValue":false} */,
                        t: ImportedPOData /* INFOTABLE */,
                        value: row.PURCHASE_ORDER_CODE.toString().trim() /* STRING */
                    };

                    let checkPOResult = Resources["InfoTableFunctions"].EQFilter(paramsForCheckPOKey);
                    if (checkPOResult.getRowCount() > 0) {
                        POIDData = checkPOResult.rows[0].PR_KEY
                    } else {
                        throw ("Không tìm thấy số YC " + row.PURCHASE_ORDER_CODE + " trong sheet Thông tin PO. Kiểm tra lại sheet Chi tiết PO");

                    }

                    // ImportedPOData.rows.forEach(ImportedPODataRow => {
                    // 	if (ImportedPODataRow.PURCHASE_ORDER_CODE == row.PURCHASE_ORDER_CODE) {
                    // 		POIDData = ImportedPODataRow.PR_KEY;
                    // 	}
                    // });

                    // if (!POIDData) {
                    // 	throw ("Không tìm thấy số YC " + row.PURCHASE_ORDER_CODE + " trong sheet Thông tin PO. Kiểm tra lại sheet Chi tiết PO");
                    // }


                    let ProductID;
                    let ProductDataString = row.PO_DETAILS_PROD_CODE.replace(/\s/g, "").split("-")[1];
                    let ProductData = Things["CTA.Business.Categories.MD_PRODUCT"].FilterImportingData({
                        fieldName: "PRODUCT_CODE" /* STRING [Required] */,
                        valueField: ProductDataString /* STRING */
                    });
                    if (ProductData.getRowCount() > 0) {
                        ProductID = ProductData.rows[0].PRODUCT_ID;
                    } else {
                        throw ("Không tìm thấy thông tin sản phẩm " + ProductDataString + " !");
                    }

                    let ColorID;
                    let ColorDataArray = row.PO_DETAILS_PROD_CODE.replace(/\s/g, "").split("-");
                    if (row.COLOR_ID && row.COLOR_ID.toString().trim().length > 0) {
                        let ColorData = Things["CTA.Business.Categories.Md_Colors"].FilterImportingData({
                            fieldName: "COLOR_CODE" /* STRING [Required] */,
                            valueField: row.COLOR_ID.toString().trim() /* STRING */
                        });
                        if (ColorData.getRowCount() > 0) {
                            ColorID = ColorData.rows[0].COLOR_ID;
                        } else {
                            throw ("Lỗi filter color data 1");
                        }
                    } else {
                        let ColorData = Things["CTA.Business.Categories.Md_Colors"].FilterImportingData({
                            fieldName: "COLOR_CODE" /* STRING [Required] */,
                            valueField: "None" /* STRING */
                        });
                        if (ColorData.getRowCount() > 0) {
                            ColorID = ColorData.rows[0].COLOR_ID;
                        } else {
                            throw ("Lỗi filter color data 2");
                        }
                    }
                    if (!ColorID) {
                        throw ("Không tìm thấy mã màu");
                    }

                    let PRODUCT_SIZE;
                    let PRODUCT_SIZE_DataArray = row.PO_DETAILS_PROD_CODE.replace(/\s/g, "").split("-");
                    if (!parseFloat(PRODUCT_SIZE_DataArray[2])) {
                        throw ("Dữ liệu Kích thước sản phẩm trong Code sản phẩm " + row.PO_DETAILS_PROD_CODE.replace(/\s/g, "") + " sai định dạng (" + PRODUCT_SIZE_DataArray[2] + ")");
                    } else {
                        let checkMinMaxData = me.LoadingData({
                            strQuery: "select * from SYS_SYSTEMVAR where VAR_GROUP = 'PO_DETAILS'"
                        })

                        let PRODUCT_SIZE_MIN = 1;
                        let PRODUCT_SIZE_MAX = 100.1;
                        checkMinMaxData.rows.forEach(minMaxValue => {
                            switch (minMaxValue.VAR_NAME) {
                                case 'PRODUCT_SIZE_MIN':
                                    PRODUCT_SIZE_MIN = minMaxValue.VAR_VALUE;
                                    break;
                                case 'PRODUCT_SIZE_MAX':
                                    PRODUCT_SIZE_MAX = minMaxValue.VAR_VALUE;
                                    break;
                            }
                        })
                        PRODUCT_SIZE = parseFloat(PRODUCT_SIZE_DataArray[2]) * 1000;
                        if (PRODUCT_SIZE < PRODUCT_SIZE_MIN) {
                            throw ("Dữ liệu Kích thước sản phẩm trong Code sản phẩm " + row.PO_DETAILS_PROD_CODE.replace(/\s/g, "") + " có Kích thước nhỏ hơn quy định (" + (PRODUCT_SIZE_MIN / 1000) + "m)");
                        }
                        if (PRODUCT_SIZE > PRODUCT_SIZE_MAX) {
                            throw ("Dữ liệu Kích thước sản phẩm trong Code sản phẩm " + row.PO_DETAILS_PROD_CODE.replace(/\s/g, "") + " có Kích thước lớn hơn quy định (" + PRODUCT_SIZE_MAX / 1000 + "m)");
                        }
                    }

                    let AlloyID = 10;
                    let checkPOData = me.LoadingData({
                        strQuery: "select * from PURCHASE_ORDER where PURCHASE_ORDER_CODE = '" + row.PURCHASE_ORDER_CODE + "'"
                    });
                    if (checkPOData.getRowCount() > 0) {
                        let checkPODetailData = me.LoadingData({
                            strQuery: "select * from PURCHASE_ORDER_DETAILS where FR_KEY = " + checkPOData.rows[0].PR_KEY
                        });
                        if (checkPODetailData.getRowCount() > 0) {
                            AlloyID = checkPODetailData.rows[0].ALLOYS_ID;
                        }
                    }

                    let newEntry = {
                        PR_KEY: lastestID.rows[0].PR_KEY + i,
                        FR_KEY: POIDData,
                        PRODUCT_ID: ProductID ? ProductID : null,
                        PO_DETAILS_PROD_CODE: row.PO_DETAILS_PROD_CODE,
                        COLOR_ID: ColorID ? ColorID : null,
                        ALLOYS_ID: AlloyID ? AlloyID : null,
                        UNIT_ID: ProductData.rows[0].UNIT_ID,
                        QUANTITY: row.QUANTITY_INCOME,
                        PRODUCT_SIZE: PRODUCT_SIZE,
                        PRODUCT_PROPORTION: 0.1,
                        PRIORITY: 0,
                        IS_ACTIVE: 1,
                        CREATED_DATE: convertDateString(currentDatetimeToString),
                        CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(),
                        UPDATED_DATE: convertDateString(currentDatetimeToString),
                        UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(),
                    };
                    let checkPODetailDataExist = me.LoadingData({
                        strQuery: "select * from PURCHASE_ORDER_DETAILS where fr_key = " + POIDData + " and PO_DETAILS_PROD_CODE = '" + row.PO_DETAILS_PROD_CODE + "'" /* STRING [Required] */
                    });
                    if (checkPODetailDataExist.getRowCount() == 0) {
                        let checkExistedData = false;
                        NewPODetailData.rows.forEach(NewDataRow => {
                            if (NewDataRow.FR_KEY == newEntry.FR_KEY && NewDataRow.PO_DETAILS_PROD_CODE == newEntry.PO_DETAILS_PROD_CODE) {
                                checkExistedData = true;
                            }
                        });
                        if (!checkExistedData) {
                            NewPODetailData.AddRow(newEntry);
                            i++;
                        }
                    } else if (checkPODetailDataExist.getRowCount() > 0) {
                        //check số giá
                        let checkWO = me.LoadingData({
                            strQuery: "select * from WORK_ORDERS where FR_KEY = " + checkPODetailDataExist.rows[0].PR_KEY
                        });
                        if (checkWO.getRowCount() > 0) {
                            checkWO.rows.forEach(WO_row => {
                                let checkProductionMasterDetail = me.LoadingData({
                                    strQuery: "select * from PRODUCTION_MASTER_DETAIL where WORK_ORDER_ID = " + WO_row.PR_KEY + " and PRODUCT_LOT_NUMBER = '" + row.LOT_NUMBER + "' and PALLET_ID = '" + row.PALLET_ID + "'"
                                });
                                if (checkProductionMasterDetail.getRowCount() > 0) {
                                    throw ("Lot sản phẩm " + row.LOT_NUMBER + " với số giá " + row.PALLET_ID + " đã có trong đơn hàng " + row.PURCHASE_ORDER_CODE + ", được dùng cho Code sản phẩm " + row.PO_DETAILS_PROD_CODE + "!");
                                }
                            });
                        }

                        UpdatingPODetailData.AddRow(checkPODetailDataExist.rows[0]);
                    } else {
                        throw ("Lỗi. Kiểm tra lại file!");
                    }
                }
            });
        }
    }

    // for (let i = UpdatingPODetailData.rows.length - 1; i > 0; i--) {
    // 	if (UpdatingPODetailData.rows[i].PR_KEY == UpdatingPODetailData.rows[i - 1].PR_KEY) {
    // 		UpdatingPODetailData.RemoveRow(i);
    // 	}
    // }
    // for (let i = NewPODetailData.rows.length - 1; i > 0; i--) {
    // 	if (NewPODetailData.rows[i].PR_KEY == NewPODetailData.rows[i - 1].PR_KEY) {
    // 		NewPODetailData.RemoveRow(i);
    // 	}
    // }

    if (isDataForAging) {
        function checkDuplicateCode(data, sheetName, keyName) {
            try {
                let purchaseOrders = data[sheetName];

                const codes = [];
                for (let i = 0; i < purchaseOrders.toString().length; i++) {
                    let code = purchaseOrders[i][keyName];
                    if (code && codes.indexOf(code) !== -1) {
                        return {
                            isExisted: true,
                            LotNumber: code,
                        };
                    }
                    codes.push(code);
                }
                return {
                    isExisted: false,
                };
            } catch (error) {
                return {
                    isExisted: false,
                };
            }
        }
        // if (checkDuplicateCode(importedJsonData, "CTA_Paint", "LOT_NUMBER").isExisted) {
        // 	throw ("Sheet CTA_Paint có Lot sản phẩm " + checkDuplicateCode(importedJsonData, "CTA_Paint", "LOT_NUMBER").LotNumber + " trùng lặp!");
        // }

        let DSHoaGiaJsonData = importedJsonData["CTA_Paint"];

        let j = 0; //index cho work order nếu import từ màn chờ hóa già
        // let lastestIDForWorkOrder = me.Get_Pr_Key({
        //     tableName: "WORK_ORDERS" /* STRING */
        // });

        let lastestIDForProductionMasterDetail_index = 0;
        let lastestIDForProductionMasterDetail = me.Get_Pr_Key({
            tableName: "PRODUCTION_MASTER_DETAIL" /* STRING */
        });
        for (let i = 0; i < DSHoaGiaJsonData.length; i++) {
            if (Object.keys(DSHoaGiaJsonData[i]).toString().length !== 0) {
                let checkLotNumberData = me.LoadingData({
                    strQuery: "select * from WHM_PRODUCT_MASTER where LOT_NUMBER = '" + DSHoaGiaJsonData[i].LOT_NUMBER.toString().trim() + "' and PALLET_ID = '" + DSHoaGiaJsonData[i].PALLET_ID.toString().trim() + "'",
                });
                if (checkLotNumberData.getRowCount() > 0) {
                    throw ("Lot sản phẩm " + DSHoaGiaJsonData[i].LOT_NUMBER + " với số giá " + DSHoaGiaJsonData[i].PALLET_ID + " đã tồn tại!");
                }

                let paramsForCheckingDuplicatedData = {
                    fieldName: "LOT_NUMBER" /* STRING */,
                    isCaseSensitive: false /* BOOLEAN {"defaultValue":false} */,
                    t: DataForImporting_WHM_PRODUCT_MASTER /* INFOTABLE */,
                    value: DSHoaGiaJsonData[i].LOT_NUMBER.toString().trim() /* STRING */
                };
                let checkingResult = Resources["InfoTableFunctions"].EQFilter(paramsForCheckingDuplicatedData);

                if (checkingResult.getRowCount() > 0) {
                    if (checkingResult.rows[0].PALLET_ID == DSHoaGiaJsonData[i].PALLET_ID.toString().trim()) {
                        throw ("Số giá " + DSHoaGiaJsonData[i].PALLET_ID + " với Lot sản phẩm " + DSHoaGiaJsonData[i].LOT_NUMBER + " bị trùng lặp");
                    }
                }

                let WorkOrderFRKEY;
                let WorkOrderColorID;
                let ProductID;
                let UnitID;
                let checkPOExist = me.LoadingData({
                    strQuery: "select PR_KEY from PURCHASE_ORDER where PURCHASE_ORDER_CODE = '" + DSHoaGiaJsonData[i].PURCHASE_ORDER_CODE + "'" /* STRING [Required] */
                });
                if (checkPOExist.getRowCount() > 0) {
                    let checkPODetailDataExist = me.LoadingData({
                        strQuery: "select * from PURCHASE_ORDER_DETAILS where fr_key = " + checkPOExist.rows[0].PR_KEY + " and PO_DETAILS_PROD_CODE = '" + DSHoaGiaJsonData[i].PO_DETAILS_PROD_CODE + "'" /* STRING [Required] */
                    });
                    if (checkPODetailDataExist.getRowCount() > 0) {
                        UpdatingPODetailData.rows.forEach(UpdatingPODetailDataRow => {
                            if (UpdatingPODetailDataRow.PO_DETAILS_PROD_CODE.toString().trim() == DSHoaGiaJsonData[i].PO_DETAILS_PROD_CODE.toString().trim()) {
                                Things["CTA.Business.Product.PO.PurchaseOrder"].AllImportedDataForAging.rows.forEach(POAllImportedDataRow => {
                                    if (UpdatingPODetailDataRow.FR_KEY == POAllImportedDataRow.PR_KEY && DSHoaGiaJsonData[i].PURCHASE_ORDER_CODE.toString().trim() == POAllImportedDataRow.PURCHASE_ORDER_CODE.toString().trim()) {
                                        WorkOrderFRKEY = UpdatingPODetailDataRow.PR_KEY;
                                        WorkOrderColorID = UpdatingPODetailDataRow.COLOR_ID;
                                        ProductID = UpdatingPODetailDataRow.PRODUCT_ID;
                                        UnitID = UpdatingPODetailDataRow.UNIT_ID;
                                    }
                                });
                            }
                        });
                    } else {
                        NewPODetailData.rows.forEach(NewImportedDataRow => {
                            if (NewImportedDataRow.PO_DETAILS_PROD_CODE.toString().trim() == DSHoaGiaJsonData[i].PO_DETAILS_PROD_CODE.toString().trim()) {
                                Things["CTA.Business.Product.PO.PurchaseOrder"].AllImportedDataForAging.rows.forEach(POAllImportedDataRow => {
                                    if (NewImportedDataRow.FR_KEY == POAllImportedDataRow.PR_KEY && DSHoaGiaJsonData[i].PURCHASE_ORDER_CODE.toString().trim() == POAllImportedDataRow.PURCHASE_ORDER_CODE.toString().trim()) {
                                        WorkOrderFRKEY = NewImportedDataRow.PR_KEY;
                                        WorkOrderColorID = NewImportedDataRow.COLOR_ID;
                                        ProductID = NewImportedDataRow.PRODUCT_ID;
                                        UnitID = NewImportedDataRow.UNIT_ID;
                                    }
                                });
                            }
                        });
                    }
                } else {
                    NewPODetailData.rows.forEach(NewImportedDataRow => {
                        if (NewImportedDataRow.PO_DETAILS_PROD_CODE.toString().trim() == DSHoaGiaJsonData[i].PO_DETAILS_PROD_CODE.toString().trim()) {
                            Things["CTA.Business.Product.PO.PurchaseOrder"].AllImportedDataForAging.rows.forEach(POAllImportedDataRow => {
                                if (NewImportedDataRow.FR_KEY == POAllImportedDataRow.PR_KEY && DSHoaGiaJsonData[i].PURCHASE_ORDER_CODE.toString().trim() == POAllImportedDataRow.PURCHASE_ORDER_CODE.toString().trim()) {
                                    WorkOrderFRKEY = NewImportedDataRow.PR_KEY;
                                    WorkOrderColorID = NewImportedDataRow.COLOR_ID;
                                    ProductID = NewImportedDataRow.PRODUCT_ID;
                                    UnitID = NewImportedDataRow.UNIT_ID;
                                }
                            });
                        }
                    });
                }

                if (!WorkOrderColorID) {
                    throw ("Kiểm tra lại Code sản phẩm trong Sheet CTA_Paint!");
                }

                let newEntryForWorkOrder = {
                    // PR_KEY: lastestIDForWorkOrder.rows[0].PR_KEY + j, // STRING [Primary Key]
                    // WORK_ORDER_CODE: "LSX_" + parseInt(lastestIDForWorkOrder.rows[0].PR_KEY) + j, // STRING
                    WORK_LINE_ID: '-1', // STRING
                    STATUS: '5', // STRING
                    QUANTITY_PLAN: DSHoaGiaJsonData[i].QUANTITY_INCOME, // NUMBER
                    QUANTITY_ACTUAL: DSHoaGiaJsonData[i].QUANTITY_INCOME, // NUMBER
                    START_DATE_PLAN: convertDateString(currentDatetimeToString), // DATETIME
                    END_DATE_PLAN: convertDateString(currentDatetimeToString), // DATETIME
                    START_DATE_ACTUAL: convertDateString(currentDatetimeToString), // DATETIME
                    END_DATE_ACTUAL: convertDateString(currentDatetimeToString), // DATETIME
                    ACTIVE: 1, // BOOLEAN
                    CREATED_DATE: convertDateString(currentDatetimeToString),
                    CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(),
                    UPDATED_DATE: convertDateString(currentDatetimeToString),
                    UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(),
                    FR_KEY: WorkOrderFRKEY, // NUMBER
                    WORK_ORDER_TYPE: "W_DEP", // STRING
                    COLOR_ID: WorkOrderColorID, // NUMBER
                    DESCRIPTION: "Lệnh sản xuất được tạo tự động từ chức năng import Danh sách chờ hóa già" // STRING
                };


                let newEntryForImportHG = {
                    PALLET_ID: DSHoaGiaJsonData[i].PALLET_ID, // STRING
                    PRODUCT_CODE: DSHoaGiaJsonData[i].PO_DETAILS_PROD_CODE, // STRING
                    PRODUCT_LOT_NUMBER: DSHoaGiaJsonData[i].LOT_NUMBER, // STRING
                    WORK_ORDER_CODE: DSHoaGiaJsonData[i].PURCHASE_ORDER_CODE, // STRING
                    TOTAL_ALUMINUM_BAR: DSHoaGiaJsonData[i].QUANTITY_INCOME,
                };

                let PO_Code_Data_Splited = DSHoaGiaJsonData[i].PO_DETAILS_PROD_CODE.split("-");
                let newEntryForImportingHG = {
                    PR_KEY: lastestIDForProductionMasterDetail.rows[0].PR_KEY + lastestIDForProductionMasterDetail_index, // NUMBER [Primary Key]
                    // WORK_ORDER_ID: newEntryForWorkOrder.PR_KEY, // NUMBER
                    WORK_ORDER_ID: -1, // NUMBER
                    WORK_LINE_ID: "-1", // STRING
                    WORK_SHIFT_ID: -1, // INTEGER
                    STAGE_TYPE: "ST", // STRING
                    PRODUCT_LOT_NUMBER: DSHoaGiaJsonData[i].LOT_NUMBER, // STRING
                    PALLET_ID: DSHoaGiaJsonData[i].PALLET_ID, // STRING
                    STATUS: "110", // STRING
                    ALUMINUM_BAR_LENGTH: parseFloat(PO_Code_Data_Splited[2]) ? parseFloat(PO_Code_Data_Splited[2]) * 1000 : 0, // NUMBER
                    TOTAL_ALUMINUM_BAR: DSHoaGiaJsonData[i].QUANTITY_INCOME, // INTEGER
                    TOTAL_ALUMINUM_BAR_DEFECT: 0, // INTEGER
                    TOTAL_WEIGHT_OF_ALUMINUM_DEFECTS: 0, // NUMBER
                    TOTAL_WEIGHT_OF_BILLET_DEFECTS: 0, // NUMBER
                    START_TIME: convertDateString(yesterdayDatetimeToString), // DATETIME
                    END_TIME: convertDateString(yesterdayDatetimeToString), // DATETIME
                    ACTUAL_WEIGHT: DSHoaGiaJsonData[i].ACTUAL_WEIGHT, // NUMBER
                    WORK_ORDER_DETAIL_ID: -1, // NUMBER
                };

                // let newEntryFor_PRODUCTION_MASTER = {
                //     WORK_LINE_ID: "-1", // STRING
                //     WORK_SHIFT_ID: -1, // INTEGER
                //     MATERIAL_ID: -1, // INTEGER
                //     WORK_ORDER_ID: newEntryForWorkOrder.PR_KEY, // NUMBER
                //     //WORK_ORDER_ID: "-1",
                //     MATERIAL_LOT_NUMBER: ' ', // STRING
                //     TOTAL_BILLETS_ON_RACK: 0, // INTEGER
                //     NUMBER_BILLET_TREE_CUT: 0, // INTEGER
                //     CUT_TIME: convertDateString(currentDatetimeToString), // DATETIME
                //     PART_NUMBER_OF_BILLET: 0, // INTEGER
                //     PART_NUMBER_OF_BILLET_STATUS: 0, // STRING
                //     PART_OF_BILLET_LENGTH_ACT: 0, // NUMBER
                //     TO_WORK_ORDER_ID: -1, // NUMBER
                //     MOLD_ID: -1, // INTEGER
                //     PRODUCT_LOT_NUMBER: DSHoaGiaJsonData[i].LOT_NUMBER, // STRING
                //     START_EXTRUSIONS: convertDateString(currentDatetimeToString), // DATETIME
                //     END_EXTRUSIONS: convertDateString(currentDatetimeToString), // DATETIME
                //     ALUMINUM_BAR_LENGTH: -1, // NUMBER
                //     TOTAL_ALUMINUM_BAR: DSHoaGiaJsonData[i].QUANTITY_INCOME, // INTEGER
                //     TOTAL_DEFECT_OF_ALUMINUM_BAR: 0, // INTEGER
                //     SUB_ALUMINUM_BAR_LENGTH_ACT: 0, // NUMBER
                //     TOTAL_NUMBER_OF_CUT: 1, // INTEGER
                //     TOTAL_NUMBER_OF_SUB_ALUM_BAR: 0, // INTEGER
                //     TOTAL_DEFECT_OF_SUB_ALUM_BAR: 0, // INTEGER
                //     TOTAL_WEIGHT_OF_ALUMINUM_DEFECTS: 0, // NUMBER
                //     CREATED_DATE: convertDateString(currentDatetimeToString), // DATETIME
                //     CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                //     UPDATED_DATE: convertDateString(currentDatetimeToString), // DATETIME
                //     UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
                // };

                let newEntryFor_WHM_PRODUCT_MASTER = {
                    WAREHOUSE_ID: WarehouseData.rows[0].WAREHOUSE_ID, // STRING
                    PALLET_ID: DSHoaGiaJsonData[i].PALLET_ID, // STRING
                    PRODUCT_ID: ProductID, // NUMBER
                    LOT_NUMBER: DSHoaGiaJsonData[i].LOT_NUMBER, // STRING
                    QUANTITY_INCOME: DSHoaGiaJsonData[i].QUANTITY_INCOME, // NUMBER
                    QUANTITY_OUTCOME: 0, // NUMBER
                    UNIT_ID: UnitID, // INTEGER
                    ALUMINUM_BAR_LENGTH: parseFloat(PO_Code_Data_Splited[2]) ? parseFloat(PO_Code_Data_Splited[2]) * 1000 : 0, // NUMBER
                    ACTUAL_WEIGHT: DSHoaGiaJsonData[i].ACTUAL_WEIGHT, // NUMBER
                    WORK_ORDER_ID: -1, // NUMBER
                    WORK_ORDER_DETAIL_ID: -1, // NUMBER
                    CREATED_DATE: convertDateString(currentDatetimeToString), // DATETIME
                    CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                    UPDATED_DATE: convertDateString(currentDatetimeToString), // DATETIME
                    UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                    STAGE_TYPE: "ST", // STRING
                    PO_DETAILS_ID: WorkOrderFRKEY
                };

                let newEntryFor_WHM_PRODUCT_VOUCHER = {
                    WH_VOUCHER_CODE: " ", // STRING
                    WAREHOUSE_ID: WarehouseData.rows[0].WAREHOUSE_ID, // STRING
                    VOUCHER_DATE: convertDateString(currentDatetimeToString), // DATETIME
                    VOUCHER_TYPE: "IN", // STRING
                    STAGE_TYPE: "ST", // STRING
                    EMPLOYEE_ID: -1, // STRING
                    PALLET_ID: DSHoaGiaJsonData[i].PALLET_ID, // STRING
                    PRODUCT_ID: ProductID, // NUMBER
                    LOT_NUMBER: DSHoaGiaJsonData[i].LOT_NUMBER, // STRING
                    QUANTITY: DSHoaGiaJsonData[i].QUANTITY_INCOME, // NUMBER
                    ACTUAL_WEIGHT: DSHoaGiaJsonData[i].ACTUAL_WEIGHT, // NUMBER
                    NOTE: " ", // STRING
                    ACTIVE: 1, // BOOLEAN
                    CREATED_DATE: convertDateString(currentDatetimeToString), // DATETIME
                    CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                    UPDATED_DATE: convertDateString(currentDatetimeToString), // DATETIME
                    UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
                };

                if (DataForImporting_WHM_PRODUCT_MASTER.getRowCount() > 0) {
                    let checkExistedAndErrorData = 1;
                    //1: dữ liệu mới
                    //2: dữ liệu trùng toàn bộ
                    //3: dữ liệu trùng lot, pallet, nhưng khác thông tin khác
                    DataForImporting_WHM_PRODUCT_MASTER.rows.forEach(DataRow => {
                        if (DataRow.PALLET_ID == DSHoaGiaJsonData[i].PALLET_ID &&
                            DSHoaGiaJsonData[i].LOT_NUMBER == DataRow.LOT_NUMBER) {
                            if (DataRow.QUANTITY_INCOME == DSHoaGiaJsonData[i].QUANTITY_INCOME &&
                                DataRow.ACTUAL_WEIGHT == DSHoaGiaJsonData[i].ACTUAL_WEIGHT &&
                                DataRow.WORK_ORDER_DETAIL_ID == WorkOrderFRKEY) {
                                checkExistedAndErrorData = 2;
                            } else {
                                checkExistedAndErrorData = 3;
                            }
                        }
                    });
                    if (checkExistedAndErrorData == 1) {
                        // WorkOrderDataForAgingImporting.AddRow(newEntryForWorkOrder);
                        j++;
                        DataForImportHGToShow.AddRow(newEntryForImportHG);
                        DataToImportDataInto_PRODUCTION_MASTER_DETAIL.AddRow(newEntryForImportingHG);
                        lastestIDForProductionMasterDetail_index++;
                        // DataForImporting_PRODUCTION_MASTER.AddRow(newEntryFor_PRODUCTION_MASTER);
                        DataForImporting_WHM_PRODUCT_MASTER.AddRow(newEntryFor_WHM_PRODUCT_MASTER);
                        DataForImporting_WHM_PRODUCT_VOUCHER.AddRow(newEntryFor_WHM_PRODUCT_VOUCHER);
                    } else if (checkExistedAndErrorData == 3) {
                        throw ("Số giá " + DSHoaGiaJsonData[i].PALLET_ID + " với Lot sản phẩm " + DSHoaGiaJsonData[i].LOT_NUMBER + " bị trùng lặp");
                    }
                } else {
                    // WorkOrderDataForAgingImporting.AddRow(newEntryForWorkOrder);
                    j++;
                    DataForImportHGToShow.AddRow(newEntryForImportHG);
                    DataToImportDataInto_PRODUCTION_MASTER_DETAIL.AddRow(newEntryForImportingHG);
                    lastestIDForProductionMasterDetail_index++;
                    // DataForImporting_PRODUCTION_MASTER.AddRow(newEntryFor_PRODUCTION_MASTER);
                    DataForImporting_WHM_PRODUCT_MASTER.AddRow(newEntryFor_WHM_PRODUCT_MASTER);
                    DataForImporting_WHM_PRODUCT_VOUCHER.AddRow(newEntryFor_WHM_PRODUCT_VOUCHER);
                }
            }
        }
    }

    // me.ImportingWorkOrderForAgingImporting = WorkOrderDataForAgingImporting;
    me.UpdatingImportedData = UpdatingPODetailData;
    me.NewImportedData = NewPODetailData;
    me.DataForImportHGToShow = DataForImportHGToShow;
    me.DataForImportHG = DataToImportDataInto_PRODUCTION_MASTER_DETAIL;
    // me.DataForImporting_PRODUCTION_MASTER = DataForImporting_PRODUCTION_MASTER;
    me.DataForImporting_WHM_PRODUCT_MASTER = DataForImporting_WHM_PRODUCT_MASTER;
    me.DataForImporting_WHM_PRODUCT_VOUCHER = DataForImporting_WHM_PRODUCT_VOUCHER;
    result = "OK";
    // result = me.NewImportedData
} catch (err) {
    result = err.toString();
}