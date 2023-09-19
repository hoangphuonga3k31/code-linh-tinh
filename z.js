var date = new Date();
let WorkShiftData = Things["CTA.Business.Product.PO.PurchaseOrder"].GetTimeDateAndShift();
// result: INFOTABLE dataShape: "AES.DataShape.Dynamic.WHM_MATERIAL_VOUCHER_DETAILS"
let Billet_info = Things["CTA.Business.Production.Production_Billet_Info"].DataAll;
let sort = {
    name: "PR_KEY",
    ascending: false
};
Billet_info.Sort(sort);
let Data = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"
});
let UpdatingBilletInfoData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"
});
Data.AddRow(Billet_info.rows[1]);

// let Billet_info_data = me.LoadingData({
//     strQuery: "SELECT * FROM PRODUCTION_BILLET_INFO WHERE WORK_ORDER_ID = "+ Billet_info.rows[1].WORK_ORDER_ID /* STRING [Required] */
// });

// let length = 0;
// for (i = 0; i < Billet_info_data.getRowCount(); i++) {
// 	length += Billet_info_data.rows[1].BILLET_TREE_INPUT_LENGTH;
// }
// let total_length = Things["CTA.Common.Categories.BilletHeating_ScanMSSQL500ms"].X1_4M1_A3C00 - length;

Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
    User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
    Length: me.X1_4M1_A3SE0 /* NUMBER */,
    Data: Data /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
    Flag: "EDIT" /* STRING */,
    Date: date /* DATETIME */
});

let NewDataFor_PRODUCTION_BILLET_MASTER = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_MASTER"
});
let updatingDataFor_PRODUCTION_BILLET_MASTER = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_MASTER"
});

let runningWO = me.LoadingData({
    strQuery: "select * from WORK_ORDERS where STATUS = '2' and WORK_ORDER_TYPE = 'W_DEP'"
});
if (runningWO.getRowCount() == 0) {
    runningWO = me.LoadingData({
        strQuery: "select top 1 * from WORK_ORDERS where STATUS = '1' and WORK_ORDER_TYPE = 'W_DEP' order by UPDATED_DATE desc"
    });
}
let LengthUsed = 0;
for (let i = 0; i < 5; i++) {
    let tagName = "X1_4M1_A1P1" + i;
    let tagData = me[tagName];

    function setData(quantityTagData) {
        let dataToUpdate = me.LoadingData({
            strQuery: "select * from PRODUCTION_BILLET_MASTER where MATERIAL_LOT_NUMBER = '" + tagData.substring(16, 30).replace(/\s/g, "") + "'" /* STRING [Required] */
        });
        //check xem trong bảng PRODUCTION_BILLET_MASTER có chưa
        if (dataToUpdate.getRowCount() > 0 && dataToUpdate.rows[0].STATUS != 'P') { // có rồi > update dữ liệu
            dataToUpdate.rows[0].STATUS = 'P';
            dataToUpdate.rows[0].QUALITY = quantityTagData;
            if (dataToUpdate.rows[0].QUALITY == tagData.substring(30, 32).replace(/\s/g, "")) {
                dataToUpdate.rows[0].STATUS = 'C';
            }
            updatingDataFor_PRODUCTION_BILLET_MASTER.AddRow(dataToUpdate.rows[0]);
        } else { //chưa có > insert dữ liệu

            // let newEntryForPBM = {
            //     WORK_LINE_ID: "Line_04", // STRING
            //     WORK_SHIFT_ID: WorkShiftData.rows[0].SHIFT, // INTEGER
            //     WHM_MATERIAL_VOUCHER_ID: undefined, // NUMBER
            //     MATERIAL_ID: undefined, // INTEGER
            //     MATERIAL_LOT_NUMBER: undefined, // STRING
            //     QUALITY: undefined, // INTEGER
            //     CHECK_IN_DATE: date, // DATETIME
            //     STATUS: "P", // STRING
            //     ACTIVE: 1, // BOOLEAN
            // };

            // NewDataFor_PRODUCTION_BILLET_MASTER.AddRow(newEntryForPBM);
        }

        //kiểm tra dữ liệu trong bảng PRODUCTION_BILLET_INFO, dựa theo lot
        let PBIdata = me.LoadingData({
            strQuery: "select PR_KEY from PRODUCTION_BILLET_INFO where MATERIAL_LOT_NUMBER = '" + tagData.substring(16, 30).replace(/\s/g, "") + "' order by NUMBER_BILLET_TREE_INPUT"
        });
        if (PBIdata.getRowCount() > 0) { //nếu có dữ liệu, đọc từng row dữ liệu dựa theo số thanh xác định được từ tag
            for (let zz = 0; zz < quantityTagData; zz++) {
                LengthUsed += me["X1_4M1_A1P" + (26 + zz).toString().padStart(2, "0")];
                let checkData = me.LoadingData({ // lấy dữ liệu dựa theo lot và thứ tự từng thanh
                    strQuery: "select * from PRODUCTION_BILLET_INFO where MATERIAL_LOT_NUMBER = '" + tagData.substring(16, 30).replace(/\s/g, "") + "' and NUMBER_BILLET_TREE_INPUT = " + (zz + 1)
                });
                if (checkData.getRowCount() == 0) { //nếu chưa lưu bản ghi này > insert bản ghi mới
                    let NewBilletInfoData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
                        infoTableName: "InfoTable",
                        dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"
                    });

                    let WOData = me.LoadingData({
                        strQuery: "select WO.PR_KEY as PR_KEY, WOB.MATERIAL_ID as MATERIAL_ID, WOB.QUANTITY_2 as QUANTITY_2 from WORK_ORDERS WO join WORK_ORDER_BOM WOB on WOB.FR_KEY = WO.PR_KEY and WOB.BOM_TYPE = 'MATL' where WO.WORK_ORDER_CODE = '" + runningWO.rows[0].WORK_ORDER_CODE + "' and WOB.LOT_NUMBER = '" + tagData.substring(16, 30).replace(/\s/g, "") + "'"
                    });

                    let quantityTagName = "X1_4M1_A1P" + (i + 15).toString().padStart(2, "0");
                    let quantityTagData = me[quantityTagName];
                    let lengthTagName = "X1_4M1_A1P" + (26 + zz).toString().padStart(2, "0");
                    let lengthTagData = me[lengthTagName];


                    let newEntryData = {
                        WORK_ORDER_ID: WOData.getRowCount() > 0 ? WOData.rows[0].PR_KEY : -1, // NUMBER
                        WORK_LINE_ID: "Line_04", // STRING
                        WORK_SHIFT_ID: WorkShiftData.rows[0].SHIFT, // INTEGER
                        MATERIAL_ID: WOData.getRowCount() > 0 ? WOData.rows[0].MATERIAL_ID : -1, // INTEGER
                        MATERIAL_LOT_NUMBER: tagData.substring(16, 30).replace(/\s/g, ""), // STRING
                        TOTAL_BILLETS_ON_RACK: quantityTagData, // INTEGER
                        NUMBER_BILLET_TREE_INPUT: zz + 1, // INTEGER
                        INPUT_DATE: date, // DATETIME
                        BILLET_TREE_INPUT_LENGTH: me[lengthTagData], // NUMBER
                        BILLET_TREE_STATUS: 'S', // STRING
                        PART_OF_BILLET_LENGTH: WOData.getRowCount() > 0 ? WOData.rows[0].QUANTITY_2 : 0, // NUMBER
                        TOTAL_DEFECTS_OF_BILLET: 0, // NUMBER
                        TO_WORK_ORDER_ID: -1, // NUMBER
                        CREATED_DATE: date, // DATETIME
                        CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                        UPDATED_DATE: date, // DATETIME
                        UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
                    };
                    NewBilletInfoData.AddRow(newEntryData);
                    Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
                        User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
                        Length: me.X1_4M1_A3SE0 /* NUMBER */,
                        Data: NewBilletInfoData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
                        Flag: "ADD" /* STRING */,
                        Date: date /* DATETIME */
                    });
                } else { //nếu có rồi, check trùng
                    for (let zzz = 0; zzz < checkData.getRowCount(); zzz++) {
                        if (zzz == 0) { //update dữ liệu của bản ghi đầu tiên
                            if (checkData.rows[0].BILLET_TREE_INPUT_LENGTH == 0 || checkData.rows[0].BILLET_TREE_STATUS != 'S') {
                                let lengthTagName = "X1_4M1_A1P" + (26 + checkData.rows[0].NUMBER_BILLET_TREE_INPUT - 1);
                                checkData.rows[0].BILLET_TREE_INPUT_LENGTH = me[lengthTagName];
                                checkData.rows[0].BILLET_TREE_STATUS = 'S';
                                UpdatingBilletInfoData.AddRow(checkData.rows[0]);
                            }
                        } else { // xóa các bản ghi thừa
                            let DeletingBilletInfoData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
                                infoTableName: "InfoTable",
                                dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"
                            });
                            DeletingBilletInfoData.AddRow(checkData.rows[zzz]);

                            Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
                                User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
                                Length: me.X1_4M1_A3SE0 /* NUMBER */,
                                Data: DeletingBilletInfoData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
                                Flag: "DEL" /* STRING */,
                                Date: date /* DATETIME */
                            });
                        }
                    }
                }
            }
        } else { //nếu chưa có dữ liệu, insert dữ liệu
            let NewBilletInfoData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
                infoTableName: "InfoTable",
                dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"
            });
            // AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO entry object
            let WOData = me.LoadingData({
                strQuery: "select WO.PR_KEY as PR_KEY, WOB.MATERIAL_ID as MATERIAL_ID, WOB.QUANTITY_2 as QUANTITY_2 from WORK_ORDERS WO join WORK_ORDER_BOM WOB on WOB.FR_KEY = WO.PR_KEY and WOB.BOM_TYPE = 'MATL' where WO.WORK_ORDER_CODE = '" + runningWO.rows[0].WORK_ORDER_CODE + "' and WOB.LOT_NUMBER = '" + tagData.substring(16, 30).replace(/\s/g, "") + "'"
            });

            let quantityTagName = "X1_4M1_A1P" + (i + 15).toString().padStart(2, "0");
            let quantityTagData = me[quantityTagName];

            let newEntryData = {
                WORK_ORDER_ID: WOData.getRowCount() > 0 ? WOData.rows[0].PR_KEY : -1, // NUMBER
                WORK_LINE_ID: "Line_04", // STRING
                WORK_SHIFT_ID: WorkShiftData.rows[0].SHIFT, // INTEGER
                MATERIAL_ID: WOData.getRowCount() > 0 ? WOData.rows[0].MATERIAL_ID : -1, // INTEGER
                MATERIAL_LOT_NUMBER: tagData.substring(16, 30).replace(/\s/g, ""), // STRING
                TOTAL_BILLETS_ON_RACK: quantityTagData, // INTEGER
                NUMBER_BILLET_TREE_INPUT: 1, // INTEGER
                INPUT_DATE: date, // DATETIME
                BILLET_TREE_INPUT_LENGTH: me.X1_4M1_A1P26, // NUMBER
                BILLET_TREE_STATUS: 'S', // STRING
                PART_OF_BILLET_LENGTH: WOData.getRowCount() > 0 ? WOData.rows[0].QUANTITY_2 : 0, // NUMBER
                TOTAL_DEFECTS_OF_BILLET: 0, // NUMBER
                TO_WORK_ORDER_ID: -1, // NUMBER
                CREATED_DATE: date, // DATETIME
                CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                UPDATED_DATE: date, // DATETIME
                UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
            };
            NewBilletInfoData.AddRow(newEntryData);
            Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
                User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
                Length: me.X1_4M1_A3SE0 /* NUMBER */,
                Data: NewBilletInfoData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
                Flag: "ADD" /* STRING */,
                Date: date /* DATETIME */
            });

            //dữ liệu trong bảng production_master
            for (let zz = 0; zz < quantityTagData; zz++) {
                LengthUsed += me["X1_4M1_A1P" + (26 + zz).toString().padStart(2, "0")];
                let checkData = me.LoadingData({ // lấy dữ liệu dựa theo lot và thứ tự từng thanh
                    strQuery: "select * from PRODUCTION_BILLET_INFO where MATERIAL_LOT_NUMBER = '" + tagData.substring(16, 30).replace(/\s/g, "") + "' and NUMBER_BILLET_TREE_INPUT = " + (zz + 1)
                });
                if (checkData.getRowCount() == 0) { //nếu chưa lưu bản ghi này > insert bản ghi mới
                    let NewBilletInfoData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
                        infoTableName: "InfoTable",
                        dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"
                    });

                    let WOData = me.LoadingData({
                        strQuery: "select WO.PR_KEY as PR_KEY, WOB.MATERIAL_ID as MATERIAL_ID, WOB.QUANTITY_2 as QUANTITY_2 from WORK_ORDERS WO join WORK_ORDER_BOM WOB on WOB.FR_KEY = WO.PR_KEY and WOB.BOM_TYPE = 'MATL' where WO.WORK_ORDER_CODE = '" + runningWO.rows[0].WORK_ORDER_CODE + "' and WOB.LOT_NUMBER = '" + tagData.substring(16, 30).replace(/\s/g, "") + "'"
                    });

                    let quantityTagName = "X1_4M1_A1P" + (i + 15).toString().padStart(2, "0");
                    let quantityTagData = me[quantityTagName];
                    let lengthTagName = "X1_4M1_A1P" + (26 + zz).toString().padStart(2, "0");
                    let lengthTagData = me[lengthTagName];

                    let newEntryData = {
                        // PR_KEY: PBI_KEY.rows[0].PR_KEY + 1,
                        WORK_ORDER_ID: WOData.getRowCount() > 0 ? WOData.rows[0].PR_KEY : -1, // NUMBER
                        WORK_LINE_ID: "Line_04", // STRING
                        WORK_SHIFT_ID: WorkShiftData.rows[0].SHIFT, // INTEGER
                        MATERIAL_ID: WOData.getRowCount() > 0 ? WOData.rows[0].MATERIAL_ID : -1, // INTEGER
                        MATERIAL_LOT_NUMBER: tagData.substring(16, 30).replace(/\s/g, ""), // STRING
                        TOTAL_BILLETS_ON_RACK: quantityTagData, // INTEGER
                        NUMBER_BILLET_TREE_INPUT: zz + 1, // INTEGER
                        INPUT_DATE: date, // DATETIME
                        BILLET_TREE_INPUT_LENGTH: lengthTagData, // NUMBER
                        BILLET_TREE_STATUS: 'S', // STRING
                        PART_OF_BILLET_LENGTH: WOData.getRowCount() > 0 ? WOData.rows[0].QUANTITY_2 : 0, // NUMBER
                        TOTAL_DEFECTS_OF_BILLET: 0, // NUMBER
                        TO_WORK_ORDER_ID: -1, // NUMBER
                        CREATED_DATE: date, // DATETIME
                        CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                        UPDATED_DATE: date, // DATETIME
                        UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
                    };
                    NewBilletInfoData.AddRow(newEntryData);
                    Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
                        User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
                        Length: me.X1_4M1_A3SE0 /* NUMBER */,
                        Data: NewBilletInfoData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
                        Flag: "ADD" /* STRING */,
                        Date: date /* DATETIME */
                    });
                } else { //nếu có rồi, check trùng
                    for (let zzz = 0; zzz < checkData.getRowCount(); zzz++) {
                        if (zzz == 0) { //update dữ liệu của bản ghi đầu tiên
                            if (checkData.rows[0].BILLET_TREE_INPUT_LENGTH == 0 || checkData.rows[0].BILLET_TREE_STATUS != 'S') {
                                let lengthTagName = "X1_4M1_A1P" + (26 + checkData.rows[0].NUMBER_BILLET_TREE_INPUT - 1);
                                checkData.rows[0].BILLET_TREE_INPUT_LENGTH = me[lengthTagName];
                                checkData.rows[0].BILLET_TREE_STATUS = 'S';
                                UpdatingBilletInfoData.AddRow(checkData.rows[0]);
                            }
                        } else { // xóa các bản ghi thừa
                            let DeletingBilletInfoData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
                                infoTableName: "InfoTable",
                                dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"
                            });
                            DeletingBilletInfoData.AddRow(checkData.rows[zzz]);

                            Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
                                User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
                                Length: me.X1_4M1_A3SE0 /* NUMBER */,
                                Data: DeletingBilletInfoData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
                                Flag: "DEL" /* STRING */,
                                Date: date /* DATETIME */
                            });
                        }
                    }
                }
            }
        }
    }

    //nếu check đến dữ liệu trên tag cuối cùng: X1_4M1_A1P14
    if (i == 4) {
        //nếu có dữ liệu > dùng dữ liệu ở tag này
        if (tagData.length > 0 && tagData.replace(/\s/g, "").length > 0) {
            let quantityTagName = "X1_4M1_A1P" + (i + 15).toString().padStart(2, "0");
            let quantityTagData = me[quantityTagName];
            setData(quantityTagData);

        } else { // nếu không có dữ liệu, dùng dữ liệu ở tag X1_4M1_A1P13
            let previousTagName = "X1_4M1_A1P1" + (i - 1);
            let previousTagData = me[previousTagName];
            setData(previousTagData);
            break;
        }
    } else { //nếu không phải tag X1_4M1_A1P14
        //nếu không có dữ liệu, dùng dữ liệu ở tag trước đó
        if (tagData.length == 0 || tagData.replace(/\s/g, "").length == 0) {
            let previousTagName = "X1_4M1_A1P1" + (i - 1);
            let previousTagData = me[previousTagName];
            setData(previousTagData);
            break;
        } //nếu có dữ liệu, bỏ qua, đọc tag tiếp theo
    }

    // let previousTagName = "X1_4M1_A1P1" + (i - 1);
    // let previousTagData = me[previousTagName];
    // setData(previousTagData);
    // break;
}

if (updatingDataFor_PRODUCTION_BILLET_MASTER.getRowCount() > 0) {
    Things["CTA.Business.Categories.PRODUCTION_BILLET_MASTER"].SetExecuteData({
        Data: updatingDataFor_PRODUCTION_BILLET_MASTER /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_MASTER"} */,
        Flag: "EDIT" /* STRING */
    });
}

me.LengthUsed = LengthUsed;
me.NextLength = Data.rows[0].BILLET_TREE_INPUT_LENGTH - LengthUsed;