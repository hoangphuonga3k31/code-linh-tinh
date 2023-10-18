let date = function (currentTime) {
    return (
        +currentTime.getDate().toString().padStart(2, "0") +
        "/" +
        (currentTime.getMonth() + 1).toString().padStart(2, "0") +
        "/" +
        currentTime.getFullYear().toString().substring(2, 4)
    );
};
let currentToDate = date(ToDate);
let currentFromDate = date(FromDate);
result = currentToDate;
let DataPaintReport = me.GetDataPaint({
    ToDate: ToDate /* DATETIME */,
    FromDate: FromDate /* DATETIME */,
    REPORT: "R007",
});

let resultJSON = {
    value: [
        {
            TO_DATE: currentToDate,
            FROM_DATE: currentFromDate,
        },
    ],
    Config: [
        // { title: "Số YC", field: "PURCHASE_ORDER_CODE", width: 300 },
        {
            //create column group
            title: "Stt",
            field: "PR_KEY",
            hozAlign: "left",
            width: 80,
            headerSort: false,
        },
        {
            //create column group
            title: "Mác Billet",
            field: "MATERIAL_NAME",
            hozAlign: "left",
            width: 100,
            headerSort: false,
        },
        {
            //create column group
            title: "Số Lot",
            field: "LOT_NUMBER",
            hozAlign: "left",
            width: 160,
            headerSort: false,
        },
        {
            //create column group
            title: "Mã hàng",
            field: "PO_DETAILS_PROD_CODE",
            hozAlign: "left",
            width: 80,
            headerSort: false,
        },
        {
            //create column group
            title: "Chiều dài đoạn (m)",
            field: "LENGTH_BILLET",
            hozAlign: "right",
            width: 80,
        },
        {
            //create column group
            title: "Trọng lượng đoạn (kg/m)",
            field: "WEIGHT",
            hozAlign: "right",
            width: 80,
        },
        {
            //create column group
            title: "Số đoạn",
            field: "PART_NUMBER_OF_BILLET",
            hozAlign: "right",
            width: 80,
            topCalc: "sum",
        },
        {
            //create column group
            title: "Trọng lượng Billet sử dụng (kg)",
            field: "WEIGHT_BILLET",
            hozAlign: "right",
            width: 80,
            topCalc: "sum",
        },
        {
            //create column group
            title: "Số lượng (kg)",
            field: "TOTAL",
            hozAlign: "right",
            width: 80,
            topCalc: "sum",
        },
        {
            //create column group
            title: "Số cây",
            field: "PART_NUMBER_OF_BILLET",
            hozAlign: "right",
            width: 80,
            topCalc: "sum",
        },
        {
            //create column group
            title: "Phế (kg) tính toán",
            field: "PHE_TINH_TOAN",
            hozAlign: "right",
            width: 80,
            topCalc: "sum",
        },
        {
            //create column group
            title: "Phế (kg) cân thực tế phân bổ",
            field: "PHE",
            hozAlign: "right",
            width: 80,
            topCalc: "sum",
        },
        {
            //create column group
            title: "Tỷ lệ thành phẩm (%)",
            field: "TI_LE_TP",
            hozAlign: "right",
            width: 80,
            topCalc: "avg",
            topCalcParams: {
                precision: 1,
            },
        },
        {
            //create column group
            title: "Tỉ lệ phế (%)",
            field: "TI_LE_PHE",
            hozAlign: "right",
            width: 80,
        },
        {
            //create column group
            title: "Ghi chú",
            field: "PR_KEY",
            hozAlign: "right",
            width: 80,
        },
    ],
    Data: DataPaintReport.ToJSON().rows,
};
me.DataReportCTARPT007 = resultJSON;

result = resultJSON;
//result = DataPaintReport;
