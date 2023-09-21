function formatSecondsToDatetime(seconds) {
	var date = new Date(0); // Create a new date object with 0 milliseconds
	date.setSeconds(seconds); // Set the seconds value
	// Extract the components of the datetime
	var day = date.getDate();
	var month = date.getMonth() + 1; // Month is zero-based, so add 1
	var year = date.getFullYear();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var formattedDatetime = [
		day.toString().padStart(2, '0') + "d", // Add leading zero if necessary
		hours.toString().padStart(2, '0') + "h",
		minutes.toString().padStart(2, '0') + "m"
	].join(' '); // Join the components with hyphens

	return formattedDatetime;
}

function getDateISOString() {
	let tzoffset = (new Date()).getTimezoneOffset() * 60000;
	return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
}

let finalResult = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
	infoTableName: "InfoTable",
	dataShapeName: "AES.DataShape.Manual.MoldHeating_MoldInsideMachine"
});
let currentTime = Things["CTA.Business.Product.PO.PurchaseOrderDetails"].GetdateTime();
let IsTimeInOvenTooLong = false;
let queryString =   "select PMI.MOLD_ID as MOLD_ID, MDM.MOLD_CODE as MOLD_CODE, MDM.ERP_MOLD_CODE as ERP_MOLD_CODE, WO.PR_KEY as WORK_ORDER_ID, WO.WORK_ORDER_CODE as WORK_ORDER_CODE, PMI.CHECK_IN_DATE as CHECK_IN_DATE " +
                    "from PRODUCTION_MOLD_INFO PMI " +
                    "join MD_MOLDS MDM on PMI.MOLD_ID = MDM.MOLD_ID " + 
                    "join WORK_ORDERS WO on PMI.WORK_ORDER_ID = WO.PR_KEY " +
                    "where PMI.STATUS = '62' and NUMBER_OF_OVEN = 1"
let MoldInsideOven1 = me.LoadingData({
	strQuery: queryString /* STRING [Required] */
});

if (MoldInsideOven1.getRowCount() > 0) {
	MoldInsideOven1.rows.forEach(row => {
		//lấy mold code và erp cpde
		// let MoldMasterData = Things["CTA.Business.Categories.Md_Molds"].FilterDataTable({
		// 	Condition: undefined /* STRING */ ,
		// 	isServer: undefined /* BOOLEAN [Required] {"defaultValue":false} */ ,
		// 	fieldName: "MOLD_ID" /* STRING [Required] */ ,
		// 	valueField: row.MOLD_ID /* STRING */
		// });
		// let MoldMasterData = me.LoadingData({
		// 	strQuery: "select MOLD_ID, MOLD_CODE, ERP_MOLD_CODE from MD_MOLDS where MOLD_ID = " + row.MOLD_ID
		// })
		// lấy work order code
		// let WorkOrderData = Things["CTA.Business.Production.Dm_WorkOrders"].FilterDataTable({
		// 	Condition: undefined /* STRING */ ,
		// 	isServer: undefined /* BOOLEAN [Required] {"defaultValue":false} */ ,
		// 	fieldName: "PR_KEY" /* STRING [Required] */ ,
		// 	valueField: row.WORK_ORDER_ID /* STRING */
		// });
		// let WorkOrderData = me.LoadingData({
		// 	strQuery: "select * from WORK_ORDERS where PR_KEY = " + row.WORK_ORDER_ID
		// })
		//lấy các dữ liệu check in
		let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
		let CheckinData = row.CHECK_IN_DATE

		let differenceMs = currentTime.getTime() - (new Date(CheckinData)).getTime();
		let seconds = Math.floor(differenceMs / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		let days = Math.floor(hours / 24);
		let IsThisTimeInOvenTooLong = false;
		if (days > 0 || hours % 24 >= 24) {
			IsTimeInOvenTooLong = true;
			IsThisTimeInOvenTooLong = true;
		}
		let TOTAL_INSIDE_OVEN_TIME = days + "d " + hours % 24 + "h " + minutes % 60 + "m "
		// AES.DataShape.Manual.MoldHeating_MoldInsideMachine entry object
		let newEntry = {
            PR_KEY: undefined, // INTEGER [Primary Key]
            MOLD_ID: row.MOLD_ID, // INTEGER
            MOLD_CODE: row.MOLD_CODE, // STRING
            ERP_MOLD_CODE: row.ERP_MOLD_CODE, // STRING
            WORK_ORDER_ID: row.WORK_ORDER_ID, // INTEGER
            WORK_ORDER_CODE: row.WORK_ORDER_CODE, // STRING
            PUT_INSIDE_OVEN_TIME: row.CHECK_IN_DATE, // DATETIME
            TOTAL_INSIDE_OVEN_TIME: TOTAL_INSIDE_OVEN_TIME, // STRING
            IS_TIME_INSIDE_OVEN_TOO_LONG: IsThisTimeInOvenTooLong // BOOLEAN {"defaultValue":false}
        };
        finalResult.AddRow(newEntry);
	})
}


me.isTimeInOvenTooLong = IsTimeInOvenTooLong
result = finalResult