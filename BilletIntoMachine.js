var date = new Date();
let WorkShiftData = Things["CTA.Business.Product.PO.PurchaseOrder"].GetTimeDateAndShift();
let Data = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "InfoTable",
    dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO",
});

//check tổng số cây trong lò
let totalBilletInsidemachine = 0;
for (let i = 0; i < 5; i++) {
    let tagName = "X1_4M1_A1P1" + (i + 5).toString();
    totalBilletInsidemachine += me[tagName];
}
//check tổng số cây trong db
let checkBilletInsideMachine = me.LoadingData({
    strQuery: "select count(*) as count from PRODUCTION_BILLET_INFO where BILLET_TREE_STATUS = 'S'"
});

for (let i = 0; i < totalBilletInsidemachine - checkBilletInsideMachine.rows[0].count; i++) {
    //check xem bó trước đó có bị thiếu cây k
    let isLastRackDone = false;
    //lấy dữ liệu ở tag số cây cuối cùng
    let LastQuantityTagValue = 0;
    for (let j = 9; j >= 5; j--) {
        let QuantityTagName = "X1_4M1_A1P1" + j.toString();
        if (me[QuantityTagName] > 0) {
            LastQuantityTagValue = me[QuantityTagName];
            break;
        }
    }
    //so sánh với số cây bị miss
    if (LastQuantityTagValue < totalBilletInsidemachine - checkBilletInsideMachine.rows[0].count) {
        isLastRackDone = true;
    }

    if (isLastRackDone) {    // nếu bó trước cũng bị miss
        // lưu thông tin của bó trước đó
        let PreviousCodeBillet = "";
        let PreviousMaterialID = -1;
        let PreviousLotBillet = "";
        // tiện thể lấy thông tin của bó cuối
        let CodeBillet = "";
        let MaterialID = -1;
        let LotBillet = "";
        let NumberOfBilletTree = 0;
        //lấy dữ liệu ở tag gần cuối cùng
        for (let i = 4; i >= 0; i--) {
            let tagName = "X1_4M1_A1P1" + i.toString();
            let tagData = me[tagName];
            if (tagData.replace(/\s/g, "").length > 0) {
                // dữ liệu của bó trước đó
                PreviousTagData = me["X1_4M1_A1P1" + (i - 1).toString()];
                PreviousCodeBillet = PreviousTagData.substring(0, 16).replace(/\s/g, "");
                PreviousLotBillet = PreviousTagData.substring(16, 14).replace(/\s/g, "");

                let PreviousMaterialData = me.LoadingData({
                    strQuery: "select MATERIAL_ID from MD_MATERIALS where MATERIAL_CODE = '" + PreviousCodeBillet + "'"
                });
                PreviousMaterialID = PreviousMaterialData.getRowCount() > 0 ? PreviousMaterialData.rows[0].MATERIAL_ID : -1;

                // dữ liệu của bó cuối
                CodeBillet = tagData.substring(0, 16).replace(/\s/g, "");
                LotBillet = tagData.substring(16, 14).replace(/\s/g, "");
                let MaterialData = me.LoadingData({
                    strQuery: "select MATERIAL_ID from MD_MATERIALS where MATERIAL_CODE = '" + CodeBillet + "'"
                });
                MaterialID = MaterialData.getRowCount() > 0 ? MaterialData.rows[0].MATERIAL_ID : -1;
                NumberOfBilletTree = me["X1_4M1_A1P" + (i + 15).toString()];

                break;
            }
        }

        // tạo từng bản ghi tương ứng cho bó trước đó
        // lấy bản ghi Billet Master
        let BilletMaster = me.LoadingData({
            strQuery: "select * from PRODUCTION_BILLET_MASTER where STATUS != 'C' and MATERIAL_LOT_NUMBER = '" + PreviousLotBillet + "'"
        });
        // lấy số cây đã lưu
        let CheckBilletInfoData = me.LoadingData({
            strQuery: "select count(*) as count from PRODUCTION_BILLET_INFO where WORK_ORDER_ID = " + BilletMaster.rows[0].PR_KEY + " and MATERIAL_LOT_NUMBER = '" + PreviousLotBillet + "'"
        });
        // tạo bản ghi
        for (let index = 0; index < BilletMaster.rows[0].QUALITY - CheckBilletInfoData.rows[0].count; index++) {
            lengthBillet = me["X1_4M1_A1P" + (index + 26 + checkBilletInsideMachine.rows[0].count).toString()]
            // AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO entry object
            let newEntry = {
                WORK_ORDER_ID: BilletMaster.rows[0].PR_KEY, // NUMBER
                WORK_LINE_ID: "Line_04", // STRING
                WORK_SHIFT_ID: WorkShiftData.rows[0].SHIFT, // INTEGER
                MATERIAL_ID: PreviousMaterialID, // INTEGER
                MATERIAL_LOT_NUMBER: PreviousLotBillet, // STRING
                TOTAL_BILLETS_ON_RACK: checkBilletInsideMachine.rows[0].QUALITY, // INTEGER
                NUMBER_BILLET_TREE_INPUT: CheckBilletInfoData.rows[0].count + 1, // INTEGER
                INPUT_DATE: date, // DATETIME
                BILLET_TREE_INPUT_LENGTH: lengthBillet, // NUMBER
                BILLET_TREE_STATUS: "S", // STRING
                PART_OF_BILLET_LENGTH: me.X1_4M1_A3P15, // NUMBER
                TOTAL_DEFECTS_OF_BILLET: 0.001, // NUMBER
                TO_WORK_ORDER_ID: -1, // NUMBER
                CREATED_DATE: date, // DATETIME
                CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                UPDATED_DATE: date, // DATETIME
                UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
            };
            Data.AddRow(newEntry);
        }
        // đổi trạng thái cho bảng billet master
        BilletMaster.rows[0].STATUS = 'C';
        BilletMaster.rows[0].UPDATED_DATE = date; // DATETIME
        BilletMaster.rows[0].UPDATED_BY = Resources["CurrentSessionInfo"].GetCurrentUser(); // STRING


        // tạo bản ghi tương ứng cho bó cuối cùng
        // lấy bản ghi Billet Master
        let NextBilletMaster = me.LoadingData({
            strQuery: "select * from PRODUCTION_BILLET_MASTER where STATUS != 'C' and MATERIAL_LOT_NUMBER = '" + LotBillet + "'"
        });
        // tạo bản ghi
        for (let index = 0; index < NumberOfBilletTree; index++) {
            lengthBillet = me["X1_4M1_A1P" + (26 + totalBilletInsidemachine - NumberOfBilletTree + index).toString()]
            // AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO entry object
            let newEntry = {
                WORK_ORDER_ID: NextBilletMaster.rows[0].PR_KEY, // NUMBER
                WORK_LINE_ID: "Line_04", // STRING
                WORK_SHIFT_ID: WorkShiftData.rows[0].SHIFT, // INTEGER
                MATERIAL_ID: MaterialID, // INTEGER
                MATERIAL_LOT_NUMBER: LotBillet, // STRING
                TOTAL_BILLETS_ON_RACK: NextBilletMaster.rows[0].QUALITY, // INTEGER
                NUMBER_BILLET_TREE_INPUT: index + 1, // INTEGER
                INPUT_DATE: date, // DATETIME
                BILLET_TREE_INPUT_LENGTH: lengthBillet, // NUMBER
                BILLET_TREE_STATUS: "S", // STRING
                PART_OF_BILLET_LENGTH: me.X1_4M1_A3P15, // NUMBER
                TOTAL_DEFECTS_OF_BILLET: 0.001, // NUMBER
                TO_WORK_ORDER_ID: -1, // NUMBER
                CREATED_DATE: date, // DATETIME
                CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                UPDATED_DATE: date, // DATETIME
                UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
            };
            Data.AddRow(newEntry);
        }

    } else {                // nếu bó trước không bị miss
        //lấy các thông tin code, lot billet
        let CodeBillet = "";
        let MaterialID = -1;
        let LotBillet = "";

        //lấy dữ liệu ở tag cuối cùng
        for (let i = 4; i >= 0; i--) {
            let tagName = "X1_4M1_A1P1" + i.toString();
            let tagData = me[tagName];
            if (tagData.replace(/\s/g, "").length > 0) {
                CodeBillet = tagData.substring(0, 16).replace(/\s/g, "");
                LotBillet = tagData.substring(16, 14).replace(/\s/g, "");

                let MaterialData = me.LoadingData({
                    strQuery: "select MATERIAL_ID from MD_MATERIALS where MATERIAL_CODE = '" + CodeBillet + "'"
                });
                MaterialID = MaterialData.getRowCount() > 0 ? MaterialData.rows[0].MATERIAL_ID : -1;
                break;
            }
        }

        // lấy bản ghi Billet Master
        let BilletMaster = me.LoadingData({
            strQuery: "select * from PRODUCTION_BILLET_MASTER where STATUS != 'C' and MATERIAL_LOT_NUMBER = '" + LotBillet + "'"
        });
        // lấy số cây đã lưu
        let CheckBilletInfoData = me.LoadingData({
            strQuery: "select count(*) as count from PRODUCTION_BILLET_INFO where WORK_ORDER_ID = " + BilletMaster.rows[0].PR_KEY + " and MATERIAL_LOT_NUMBER = '" + LotBillet + "'"
        });

        // tạo từng bản ghi tương ứng
        for (let index = 0; index < totalBilletInsidemachine - checkBilletInsideMachine.rows[0].count; index++) {
            lengthBillet = me["X1_4M1_A1P" + (index + 26 + checkBilletInsideMachine.rows[0].count).toString()]
            // AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO entry object
            let newEntry = {
                WORK_ORDER_ID: BilletMaster.rows[0].PR_KEY, // NUMBER
                WORK_LINE_ID: "Line_04", // STRING
                WORK_SHIFT_ID: WorkShiftData.rows[0].SHIFT, // INTEGER
                MATERIAL_ID: MaterialID, // INTEGER
                MATERIAL_LOT_NUMBER: LotBillet, // STRING
                TOTAL_BILLETS_ON_RACK: checkBilletInsideMachine.rows[0].QUALITY, // INTEGER
                NUMBER_BILLET_TREE_INPUT: CheckBilletInfoData.rows[0].count + 1, // INTEGER
                INPUT_DATE: date, // DATETIME
                BILLET_TREE_INPUT_LENGTH: lengthBillet, // NUMBER
                BILLET_TREE_STATUS: "S", // STRING
                PART_OF_BILLET_LENGTH: me.X1_4M1_A3P15, // NUMBER
                TOTAL_DEFECTS_OF_BILLET: 0.001, // NUMBER
                TO_WORK_ORDER_ID: -1, // NUMBER
                CREATED_DATE: date, // DATETIME
                CREATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser(), // STRING
                UPDATED_DATE: date, // DATETIME
                UPDATED_BY: Resources["CurrentSessionInfo"].GetCurrentUser() // STRING
            };
            Data.AddRow(newEntry);
        }
    }
}

// let Billet_info = me.LoadingData({
//     strQuery: "select * from PRODUCTION_BILLET_INFO where pr_key = " +
//         " (select min(PR_KEY) from PRODUCTION_BILLET_INFO where PR_KEY > " +
//         " (select max(PR_KEY) from PRODUCTION_BILLET_INFO where BILLET_TREE_STATUS = 'S') " +
//         ")"
// });

// Data.AddRow(Billet_info.rows[0]);



// Things["CTA.Business.Production.Production_Billet_Info"].SetExecuteDataUpdate({
//     User: Resources["CurrentSessionInfo"].GetCurrentUser() /* STRING */,
//     Length: me.X1_4M1_A3SE0 /* NUMBER */,
//     Data: Data /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_INFO"} */,
//     Flag: "EDIT" /* STRING */,
//     Date: date /* DATETIME */,
// });