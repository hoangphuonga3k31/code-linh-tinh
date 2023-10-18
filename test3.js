//CTARPT008
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

let DataProgressReportAging = me.ProgressReportAgingGetData({
	FromDate: FromDate /* DATETIME */,
	ToDate: ToDate /* DATETIME */
});


let resultJSON = {
	value: [
		{
			TO_DATE: currentToDate,
			FROM_DATE: currentFromDate,
		},
	],
	"Data": DataProgressReportAging.ToJSON().rows,
	"Config": [{
		title: 'Stt',
		field: 'Stt',
		width: 60
	},
	{
		title: 'Ngày',
		field: 'DATE'
	},
	{
		title: 'Số phiếu',
		field: 'VOUCHER_NUMBER'
	}, {
		title: "ĐƠN HÀNG",
		columns: [{
			title: "Số giá",
			field: "PALLET_ID"
		},
		{
			title: "Mã sản phẩm",
			field: "PO_DETAILS_PROD_CODE"
		}, {
			title: "Số LOT",
			field: "PRODUCT_LOT_NUMBER"
		},
		{
			title: "Chiều dài(m)",
			field: "ALUMINUM_BAR_LENGTH"
		}, {
			title: "Màu sắc",
			field: "COLOR_CODE"
		},
		{
			title: "Số lượng(thanh)",
			field: "QUANTITY_BAR"
		}, {
			title: "Số lượng(kg)",
			field: "QUANTITY_KG"
		}
		],
	}, {
		title: "PHẾ PHẨM",
		columns: [{
			title: "Không đạt(Thanh)",
			field: "TOTAL_ALUMINUM_BAR_DEFECT"
		}]
	}, {
		title: "THỜI GIAN LÀM VIỆC",
		columns: [{
			title: "Bắt đầu(h.m)",
			field: "START_TIME"
		}, {
			title: "Kết thúc(h.m)",
			field: "END_TIME"
		}, {
			title: "Số tiếng",
			field: "NUMBER_OF_HOUR"
		}]
	}, {
		title: 'Loại lò',
		field: 'OVEN_TYPE'
	}
	]
}
me.ConfigAndDataJSONReportAging = resultJSON;
result = resultJSON;