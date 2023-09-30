if (me.X1_4M1_A1P48 == false) {
    let a = 0;
} else {
    let runningWOKEY = -1;
    let runningWO = me.LoadingData({
        strQuery: "select PR_KEY from WORK_ORDERS where WORK_ORDER_TYPE = 'W_DEP' and STATUS = '2'"
    });
    if (runningWO.getRowCount > 0) {
        runningWOKEY = runningWO.rows[0].PR_KEY;
    } else {
        let ReleasedWO = me.LoadingData({
            strQuery: "select top 1 PR_KEY from WORK_ORDERS where WORK_ORDER_TYPE = 'W_DEP' and STATUS = '1' order by UPDATED_DATE desc"
        })
        if (ReleasedWO.getRowCount() > 0) {
            runningWOKEY = ReleasedWO.rows[0].PR_KEY
        }
    }
    // lấy dữ liệu từ tag
    //	let LotBillet_String = "".replace(/\s/g, '');
    //	let CodeBillet_String = "".replace(/\s/g, '');
    //	let NumberOfBillet_Int = 0;
    let LotBillet_String = me.X1_4M1_A1P45.replace(/\s/g, '');
    let CodeBillet_String = me.X1_4M1_A1P46.replace(/\s/g, '');
    let NumberOfBillet_Int = me.X1_4M1_A1P47;

    let currentDatetime = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].GetdateTime();
    let TimeDateAndShiftData = Things["CTA.Business.Product.PO.PurchaseOrder"].GetTimeDateAndShift();

    //check dữ liệu tồn tại chưa
    let checkMaterialData = me.LoadingData({
        strQuery: "select MATERIAL_ID from MD_MATERIALS where MATERIAL_CODE = '" + CodeBillet_String + "'"
    });
    let queryString = "select * from PRODUCTION_BILLET_MASTER where MATERIAL_LOT_NUMBER = '" + LotBillet_String + "' and ACTIVE = 1 and MATERIAL_ID = " + checkMaterialData.rows[0].MATERIAL_ID;
    let checkExistedBillet = me.LoadingData({
        strQuery: queryString /* STRING [Required] */
    });

    switch (checkExistedBillet.getRowCount() > 0) {
        case false: // chưa có, tạo bản ghi mới
            let dataTableToInsert = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
                infoTableName: "InfoTable",
                dataShapeName: "AES.DataShape.Dynamic.PRODUCTION_BILLET_MASTER"
            });

            let VoucherDetailID = -1;
            if (runningWOKEY != -1) {
                let VoucherDetailData = me.LoadingData({
                    strQuery: "select FR_KEY from WHM_MATERIAL_VOUCHER_DETAILS where WORK_ORDER_ID = " + runningWOKEY + " and LOT_NUMBER = '" + LotBillet_String + "'"
                })
                if (VoucherDetailData.getRowCount() > 0) {
                    VoucherDetailID = VoucherDetailData.rows[0].FR_KEY;
                }
            }
            let newEntryToInsert = {
                WORK_LINE_ID: "Line_04", // STRING
                WORK_SHIFT_ID: TimeDateAndShiftData.rows[0].SHIFT, // INTEGER
                WHM_MATERIAL_VOUCHER_ID: VoucherDetailID, // NUMBER
                MATERIAL_ID: checkMaterialData.rows[0].MATERIAL_ID, // INTEGER
                MATERIAL_LOT_NUMBER: LotBillet_String, // STRING
                QUALITY: NumberOfBillet_Int, // INTEGER
                CHECK_IN_DATE: currentDatetime, // DATETIME
                STATUS: 'W', // STRING
                ACTIVE: 1, // BOOLEAN
            };
            dataTableToInsert.AddRow(newEntryToInsert);
            Things["CTA.Business.Categories.PRODUCTION_BILLET_MASTER"].SetExecuteData({
                Data: dataTableToInsert /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_MASTER"} */,
                Flag: "ADD" /* STRING */
            });
            break;

        case true: // đã có, update bản ghi cũ
            checkExistedBillet.rows[0].QUALITY += NumberOfBillet_Int;
            Things["CTA.Business.Categories.PRODUCTION_BILLET_MASTER"].SetExecuteData({
                Data: checkExistedBillet /* INFOTABLE {"dataShape":"AES.DataShape.Dynamic.PRODUCTION_BILLET_MASTER"} */,
                Flag: "EDIT" /* STRING */
            });
            break;
    }
    //tạo chuỗi và gắn lên tag trống
    let DataString =
        CodeBillet_String.padEnd(16, ' ') +
        LotBillet_String.padEnd(14, ' ') +
        NumberOfBillet_Int.toString().padEnd(2, " ");

    for (let i = 0; i < 10; i++) {
        let tagName = "X1_4M1_A1P0" + i.toString().padEnd(1, "0");
        let tagData = me[tagName];
        if (tagData.length > 0 && tagData.replace(/\s/g, '').length > 0) {
            let z = 0;
        } else {
            me[tagName] = DataString;
            break;
        }
    }
}