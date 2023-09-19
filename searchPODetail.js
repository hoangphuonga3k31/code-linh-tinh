function containsStringIgnoringCaseAndUTF8(mainString, searchString) {
    // Function to remove diacritics from a string
    function removeDiacritics(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Convert both strings to lowercase and remove diacritics
    const normalizedMainString = removeDiacritics(mainString.toLowerCase());
    const normalizedSearchString = removeDiacritics(searchString.toLowerCase());

    // Check if the main string contains the search string
    return normalizedMainString.indexOf(normalizedSearchString) !== -1;
}

let ws = new Array();
me.DataTable_Structure.rows.toArray().forEach(row => {
    if (row.DATA_FIELD != "PR_KEY" && row.DATA_FIELD != "IS_ACTIVE" && row.DATA_FIELD != "USER_ID") {
        ws.push(row.DATA_FIELD);
    }

});

ws.join(',');
let val = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape({
    infoTableName: "FilterTable" + me.TableName,
    dataShapeName: "AES.DataShape.Manual.PURCHASE_ORDER_DETAILS"
});
let str = "";
let setActive = 0;
if (!isServer) {
    if (!active) {
        setActive = 1;
    }
    for (var i = 0; i < me.DataTable.rows.length; i++) {
        let colorAndAlloyAndUnitAndProductData = me.LoadingData({
            strQuery: "select MD_COLORS.COLOR_CODE, MD_COLORS.COLOR_NAME, MD_ALLOYS.ALLOYS_CODE, MD_ALLOYS.ALLOYS_NAME, MD_UNIT.UNIT_CODE, MD_ALLOYS.ALLOYS_NAME, MD_PRODUCT.PRODUCT_CODE, MD_PRODUCT.PRODUCT_NAME" +
                " from MD_COLORS join MD_ALLOYS on 1 = 1 join MD_UNIT on 1 = 1 join MD_PRODUCT on 1 = 1" +
                " where MD_COLORS.COLOR_ID = " + me.DataTable.rows[i].COLOR_ID +
                " and MD_ALLOYS.ALLOYS_ID = " + me.DataTable.rows[i].ALLOYS_ID +
                " and MD_UNIT.UNIT_ID = " + me.DataTable.rows[i].UNIT_ID +
                " and MD_PRODUCT.PRODUCT_ID = " + me.DataTable.rows[i].PRODUCT_ID
        });

        let newEntry = {
            PRODUCT_ID: me.DataTable.rows[i].PRODUCT_ID, // NUMBER
            PRODUCT_CODE: colorAndAlloyAndUnitAndProductData.rows[0].PRODUCT_CODE,
            PO_DETAILS_PROD_CODE: me.DataTable.rows[i].PO_DETAILS_PROD_CODE, // STRING
            COLOR_ID: me.DataTable.rows[i].COLOR_ID, // INTEGER
            ALLOYS_ID: me.DataTable.rows[i].ALLOYS_ID, // INTEGER
            UNIT_ID: me.DataTable.rows[i].UNIT_ID, // INTEGER
            QUANTITY: me.DataTable.rows[i].QUANTITY, // NUMBER
            PRODUCT_SIZE: me.DataTable.rows[i].PRODUCT_SIZE, // NUMBER
            PRODUCT_PROPORTION: me.DataTable.rows[i].PRODUCT_PROPORTION, // NUMBER
            PRIORITY: me.DataTable.rows[i].PRIORITY, // BOOLEAN
            IS_ACTIVE: me.DataTable.rows[i].IS_ACTIVE, // BOOLEAN
            CREATED_DATE: me.DataTable.rows[i].CREATED_DATE, // DATETIME
            CREATED_BY: me.DataTable.rows[i].CREATED_BY, // STRING
            UPDATED_DATE: me.DataTable.rows[i].UPDATED_DATE, // DATETIME
            UPDATED_BY: me.DataTable.rows[i].UPDATED_BY, // STRING
            PR_KEY: me.DataTable.rows[i].PR_KEY, // NUMBER [Primary Key]
            FR_KEY: me.DataTable.rows[i].FR_KEY, // NUMBER
            ELECTROSTATIC_PAINT: me.DataTable.rows[i].ELECTROSTATIC_PAINT, // BOOLEAN {"defaultValue":true}
            COLOR_PAINT: me.DataTable.rows[i].COLOR_PAINT, // BOOLEAN {"defaultValue":false}
            COLOR_CODE: colorAndAlloyAndUnitAndProductData.rows[0].COLOR_CODE + " - " + colorAndAlloyAndUnitAndProductData.rows[0].COLOR_NAME, // STRING
            ALLOYS_CODE: colorAndAlloyAndUnitAndProductData.rows[0].ALLOYS_CODE + " - " + colorAndAlloyAndUnitAndProductData.rows[0].ALLOYS_NAME, // STRING
            UNIT_CODE: colorAndAlloyAndUnitAndProductData.rows[0].UNIT_CODE + " - " + colorAndAlloyAndUnitAndProductData.rows[0].UNIT_NAME // STRING
        };
        //if (me.DataTable.rows[i][fieldName] == valueField)
        //if ((!valueField || me.DataTable.rows[i].toString().toUpperCase().indexOf(valueField.toUpperCase()) >= 0) && me.DataTable.rows[i].IS_ACTIVE == setActive)
        //if ((!valueField || (me.DataTable.rows[i].COLOR_CODE.toString()+"◘"+me.DataTable.rows[i].COLOR_NAME.toString()).toUpperCase().indexOf(valueField.toUpperCase()) >= 0) && me.DataTable.rows[i].IS_ACTIVE == setActive)
        if ((!valueField || containsStringIgnoringCaseAndUTF8(newEntry.PO_DETAILS_PROD_CODE.toString() + "◘" + newEntry.PRODUCT_CODE.toString() + "◘" + newEntry.COLOR_CODE + "◘" + newEntry.ALLOYS_CODE + "◘" + newEntry.UNIT_CODE + "◘" + newEntry.QUANTITY + "◘" + newEntry.PRODUCT_SIZE + "◘" + newEntry.PRODUCT_PROPORTION, valueField)) && newEntry.IS_ACTIVE == setActive && newEntry.FR_KEY == id) {
            val.AddRow(newEntry);
        }
    }
} else {
    let ws = new Array();
    me.DataTable_Structure.rows.toArray().forEach(row => {
        if (row.DATA_FIELD != "PR_KEY" && row.DATA_FIELD != "IS_ACTIVE" && row.DATA_FIELD != "USER_ID") {
            ws.push(row.DATA_FIELD);
        }

    });

    ws.join(',');
    //str = "SELECT * FROM (" + me.internalQuery + ") A WHERE " + (Condition == "" ? "1=1" : Condition);
    str = "SELECT * FROM (" + me.internalQuery + ") A WHERE " +
        (!valueField ? "1=1" : ("CONCAT_WS(' '," + ws + ") LIKE '%" + valueField.toUpperCase() + "%'") +
            " and fr_key = " + id +
            " AND IS_ACTIVE = " + setActive);
    val = me.LoadingData({
        strQuery: str /* STRING [Required] */
    });
    //result = str;
}
me.DataFilterForAddProductToNewPO = val;
let paginatedInfortable = val;
let params = {
    infoTableName: 'DataFilterForAddProductToNewPO' /* STRING {"defaultValue":"InfoTable"} */,
    dataShapeName: 'AES.DataShape.Manual.PURCHASE_ORDER_DETAILS' /* DATASHAPENAME */
};
// result: INFOTABLE
let paginatedResult = Resources["InfoTableFunctions"].CreateInfoTableFromDataShape(params);
var numRows = paginatedInfortable.getRowCount();
var startRow = (pageNumber > 0 ? pageNumber - 1 : 0) * pageSize;
var numAdded = 0;

for (var r = startRow; r < numRows && numAdded < pageSize; r++) {
    paginatedResult.addRow(paginatedInfortable.getRow(r));
    numAdded++;
}
result = paginatedResult;