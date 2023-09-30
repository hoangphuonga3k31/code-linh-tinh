var date = new Date();
let WorkShiftData = Things["CTA.Business.Product.PO.PurchaseOrder"].GetTimeDateAndShift();
// result: INFOTABLE dataShape: "AES.DataShape.Dynamic.WHM_MATERIAL_VOUCHER_DETAILS"
Things["CTA.Business.Production.Production_Billet_Info"].GetAllData();
let Billet_info = Things["CTA.Business.Production.Production_Billet_Info"].DataAll;
let sort = {
    name: "PR_KEY",
    ascending: false,
};
Billet_info.Sort(sort);
let Data = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO",
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
    Date: date /* DATETIME */,
});

let NewDataFor_PRODUCTION_BILLET_MASTER = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_MASTER",
});
let updatingDataFor_PRODUCTION_BILLET_MASTER = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_MASTER",
});

let NewBilletInfoData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO",
});
let UpdatingBilletInfoData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO",
});

let runningWOKEY = -1;
let runningWO = me.LoadingData({
    strQuery: "select PR_KEY from WORK_ORDERS where WORK_ORDER_TYPE = 'W_DEP' and STATUS = '2'",
});
if (runningWO.getRowCount > 0) {
    runningWOKEY = runningWO.rows[0].PR_KEY;
} else {
    let ReleasedWO = me.LoadingData({
        strQuery: "select top 1 PR_KEY from WORK_ORDERS where WORK_ORDER_TYPE = 'W_DEP' and STATUS = '1' order by UPDATED_DATE desc",
    });
    if (ReleasedWO.getRowCount() > 0) {
        runningWOKEY = ReleasedWO.rows[0].PR_KEY;
    }
}

function setData(DataSoLuongThanh_FromTag, tagData, i) {
    let thisQueryString =
        "select PBM.MATERIAL_ID as MATERIAL_ID from PRODUCTION_BILLET_MASTER PBM " +
        "join WHM_MATERIAL_VOUCHER WMV on PBM.WHM_MATERIAL_VOUCHER_ID = WMV.PR_KEY " +
        "join WHM_MATERIAL_VOUCHER_DETAILS WMVD on WMV.PR_KEY = WMVD.FR_KEY " +
        "where PBM.MATERIAL_LOT_NUMBER = '" +
        tagData.substring(16, 30).replace(/\s/g, "") +
        "' and WMVD.WORK_ORDER_ID = " +
        runningWOKEY;
    let GatheringData = me.LoadingData({
        strQuery: thisQueryString,
    });
    let dataToUpdate = me.LoadingData({
        strQuery:
            "select * from PRODUCTION_BILLET_MASTER where MATERIAL_LOT_NUMBER = '" +
            tagData.substring(16, 30).replace(/\s/g, "") +
            "'" /* STRING [Required] */,
    });
    //check xem trong bảng PRODUCTION_BILLET_MASTER có chưa
    if (dataToUpdate.getRowCount() > 0) {
        // có rồi > update dữ liệu
        if (dataToUpdate.rows[0].STATUS != "P") {
            dataToUpdate.rows[0].STATUS = "P";
            dataToUpdate.rows[0].QUALITY += DataSoLuongThanh_FromTag;
        }

        if (dataToUpdate.rows[0].QUALITY == me.X1_4M1_A3C05) {
            dataToUpdate.rows[0].STATUS = "C";
        }
        updatingDataFor_PRODUCTION_BILLET_MASTER.AddRow(dataToUpdate.rows[0]);
    } else {
        //chưa có > insert dữ liệu
    }

    // //kiểm tra dữ liệu trong bảng PRODUCTION_BILLET_INFO, dựa theo lot
    // let PBIdata = me.LoadingData({
    //   strQuery:
    //     "select PR_KEY from PRODUCTION_BILLET_INFO where MATERIAL_LOT_NUMBER = '" +
    //     tagData.substring(16, 30).replace(/\s/g, "") +
    //     "' order by NUMBER_BILLET_TREE_INPUT",
    // });
    // if (PBIdata.getRowCount() > 0) {
    //   //nếu có dữ liệu, đọc từng row dữ liệu dựa theo số thanh xác định được từ tag
    //   for (let tree_order = 0; tree_order < DataSoLuongThanh_FromTag; tree_order++) {
    //     let checkResult = me.LoadingData({
    //       strQuery:
    //         "select * from PRODUCTION_BILLET_INFO where MATERIAL_LOT_NUMBER = '" +
    //         tagData.substring(16, 30).replace(/\s/g, "") +
    //         "' and NUMBER_BILLET_TREE_INPUT = " +
    //         (tree_order + 1),
    //     });
    //     if (checkResult.getRowCount() == 0) {
    //       let newEntryData = {
    //         WORK_ORDER_ID: runningWOKEY, // NUMBER
    //         WORK_LINE_ID: "Line_04", // STRING
    //         WORK_SHIFT_ID: WorkShiftData.rows[0].SHIFT, // INTEGER
    //         MATERIAL_ID: GatheringData.getRowCount() > 0 ? GatheringData.rows[0].MATERIAL_ID : -1, // INTEGER
    //         MATERIAL_LOT_NUMBER: tagData.substring(16, 30).replace(/\s/g, ""), // STRING
    //         TOTAL_BILLETS_ON_RACK: parseInt(tagData.substring(30, 32).replace(/\s/g, "")), // INTEGER
    //         NUMBER_BILLET_TREE_INPUT: tree_order + 1, // INTEGER
    //         INPUT_DATE: date, // DATETIME
    //         BILLET_TREE_INPUT_LENGTH: me["X1_4M1_A1P" + (26 + tree_order)], // NUMBER
    //         BILLET_TREE_STATUS: "S", // STRING
    //         PART_OF_BILLET_LENGTH: me.X1_4M1_A3SL0, // NUMBER
    //         TOTAL_DEFECTS_OF_BILLET: 0, // NUMBER
    //         TO_WORK_ORDER_ID: -1, // NUMBER
    //         CREATED_DATE: date, // DATETIME
    //         CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
    //         UPDATED_DATE: date, // DATETIME
    //         UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
    //       };
    //       NewBilletInfoData.AddRow(newEntryData);
    //     } else {
    //       if (checkResult.rows[0].BILLET_TREE_STATUS.replace(/\s/g, "").length == 0 || checkResult.rows[0].BILLET_TREE_INPUT_LENGTH == 0 || checkResult.rows[0].TOTAL_BILLETS_ON_RACK != parseInt(tagData.substring(30, 32).replace(/\s/g, ""))) {
    //         checkResult.rows[0].BILLET_TREE_STATUS = "S";
    //         checkResult.rows[0].BILLET_TREE_INPUT_LENGTH = me["X1_4M1_A1P" + (26 + tree_order)];
    //         checkResult.rows[0].TOTAL_BILLETS_ON_RACK = parseInt(tagData.substring(30, 32).replace(/\s/g, ""));
    //         UpdatingBilletInfoData.AddRow(checkResult.rows[0]);
    //       }

    //       for (let ExistedData = 1; ExistedData < checkResult.getRowCount(); ExistedData++) {
    //         let DeletingBilletInfoData = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    //           infoTableName: "InfoTable",
    //           dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO",
    //         });
    //         DeletingBilletInfoData.AddRow(checkResult.rows[ExistedData]);
    //         Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
    //           User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
    //           Length: me.X1_4M1_A3SE0 /* NUMBER */,
    //           Data: DeletingBilletInfoData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
    //           Flag: "DEL" /* STRING */,
    //           Date: date /* DATETIME */,
    //         });
    //       }
    //     }
    //   }
    // } else {
    //   //nếu chưa có dữ liệu, insert dữ liệu
    //   for (let billetTreeNumbers = 0; billetTreeNumbers < DataSoLuongThanh_FromTag; billetTreeNumbers++) {
    //     let newEntryData = {
    //       WORK_ORDER_ID: runningWOKEY, // NUMBER
    //       WORK_LINE_ID: "Line_04", // STRING
    //       WORK_SHIFT_ID: WorkShiftData.rows[0].SHIFT, // INTEGER
    //       MATERIAL_ID: GatheringData.getRowCount() > 0 ? GatheringData.rows[0].MATERIAL_ID : -1, // INTEGER
    //       MATERIAL_LOT_NUMBER: tagData.substring(16, 30).replace(/\s/g, ""), // STRING
    //       TOTAL_BILLETS_ON_RACK: parseInt(tagData.substring(30, 32).replace(/\s/g, "")), // INTEGER
    //       NUMBER_BILLET_TREE_INPUT: billetTreeNumbers + 1, // INTEGER
    //       INPUT_DATE: date, // DATETIME
    //       BILLET_TREE_INPUT_LENGTH: me["X1_4M1_A1P" + (26 + billetTreeNumbers)], // NUMBER
    //       BILLET_TREE_STATUS: "S", // STRING
    //       PART_OF_BILLET_LENGTH: me.X1_4M1_A3SL0, // NUMBER
    //       TOTAL_DEFECTS_OF_BILLET: 0, // NUMBER
    //       TO_WORK_ORDER_ID: -1, // NUMBER
    //       CREATED_DATE: date, // DATETIME
    //       CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
    //       UPDATED_DATE: date, // DATETIME
    //       UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
    //     };
    //     NewBilletInfoData.AddRow(newEntryData);
    //   }
    // }
}

let LengthUsed = 0;
for (let i = 0; i < 5; i++) {
    let tagName = "X1_4M1_A1P1" + i.toString().padStart(1, "0");
    let tagData = me[tagName];

    if (tagData && tagData.replace(/\s/g, "").length > 0) {
        let NumberOfBilletInsideMachine_TagName = "X1_4M1_A1P1" + (i + 5);
        let NumberOfBilletInsideMachine_TagData = me[NumberOfBilletInsideMachine_TagName];
        checkData(tagName, tagData, NumberOfBilletInsideMachine_TagData, i);
    } else {
        break;
    }
}

function checkData(tagName, tagData, quantityFromTag, index) {
    let dataToUpdate = me.LoadingData({
        strQuery:
            "select * from PRODUCTION_BILLET_MASTER where MATERIAL_LOT_NUMBER = '" +
            tagData.substring(16, 30).replace(/\s/g, "") +
            "'" /* STRING [Required] */,
    });
    //check xem trong bảng PRODUCTION_BILLET_MASTER có chưa
    if (dataToUpdate.getRowCount() > 0) {
        // có rồi > update dữ liệu
        if (dataToUpdate.rows[0].STATUS != "P") {
            dataToUpdate.rows[0].STATUS = "P";
            dataToUpdate.rows[0].QUALITY += DataSoLuongThanh_FromTag;
        }

        // if (dataToUpdate.rows[0].QUALITY == me.X1_4M1_A3C05) {
        //     dataToUpdate.rows[0].STATUS = "C";
        // }
        updatingDataFor_PRODUCTION_BILLET_MASTER.AddRow(dataToUpdate.rows[0]);
    } else {
        //chưa có > insert dữ liệu
    }

    let thisQueryString =
        "select PBM.MATERIAL_ID as MATERIAL_ID from PRODUCTION_BILLET_MASTER PBM " +
        "join WHM_MATERIAL_VOUCHER WMV on PBM.WHM_MATERIAL_VOUCHER_ID = WMV.PR_KEY " +
        "join WHM_MATERIAL_VOUCHER_DETAILS WMVD on WMV.PR_KEY = WMVD.FR_KEY " +
        "where PBM.MATERIAL_LOT_NUMBER = '" +
        tagData.substring(16, 30).replace(/\s/g, "") +
        "' and WMVD.WORK_ORDER_ID = " +
        runningWOKEY;
    let GatheringData = me.LoadingData({
        strQuery: thisQueryString,
    });

    //kiểm tra dữ liệu trong bảng PRODUCTION_BILLET_INFO, dựa theo lot
    //check lot đầu tiên
    if (index == 0) {

    }
    let PBIdata = me.LoadingData({
        strQuery:
            "select PR_KEY from PRODUCTION_BILLET_INFO where MATERIAL_LOT_NUMBER = '" +
            tagData.substring(16, 30).replace(/\s/g, "") +
            "' order by NUMBER_BILLET_TREE_INPUT",
    });


}

if (updatingDataFor_PRODUCTION_BILLET_MASTER.getRowCount() > 0) {
    Things["CTA.Business.Categories.PRODUCTION_BILLET_MASTER"].SetExecuteData({
        Data: updatingDataFor_PRODUCTION_BILLET_MASTER /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_MASTER"} */,
        Flag: "EDIT" /* STRING */,
    });
}

if (NewBilletInfoData.getRowCount() > 0) {
    Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
        User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
        Length: me.X1_4M1_A3SE0 /* NUMBER */,
        Data: NewBilletInfoData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
        Flag: "ADD" /* STRING */,
        Date: date /* DATETIME */,
    });
}

if (UpdatingBilletInfoData.getRowCount() > 0) {
    Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
        User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
        Length: me.X1_4M1_A3SE0 /* NUMBER */,
        Data: UpdatingBilletInfoData /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
        Flag: "EDIT" /* STRING */,
        Date: date /* DATETIME */,
    });
}
