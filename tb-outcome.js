$(document).ready(function(){
	// get the selected ouganization unit in the data entry page
	var selectedOrgUnit = selection.getSelected()[0];
	
	// get the selected period in the data entry page
	var selectedPeriod = $("#selectedPeriodId").val();
	
	// extract the year part of the period
	var selectedPeriodYear = selectedPeriod.substring(0,4);
	
	// extract the month part of the period
	var selectedPeriodMonth = selectedPeriod.substring(4,6);
	
	// get the previous year, subtract 1 from the year
	var periodYear = parseInt(selectedPeriodYear) - 1;
	
	// join the previous year and the month, data to be fetched from the same month of last year
	var period = periodYear+selectedPeriodMonth;
	
	// URL to fetch the data
	var url = "/hmis/api/29/analytics.json?dimension=dx:";
	url += "fEqA4AtMjJL;k26RPrXIpoo;gN5dGI91IcU;Vn2hxlC0kae;VJG7eqFdNFw;GyNhrvFPQaO;"; //PBC
	url += "wn7uqOYMdca;VAT9uMm4nmr;xVkVMUdLQ6I;PhcKMCuqZhT;hUFnA75Fp9R;"; // PCD
	url += "RFALSJwSpmd;Y1i5hgjTImc;igiGrm5xZlX;wfjQWicPkkd;GktEjOoQRGM;"; // EP
	url += "U3Zj0k3A9Wc"; //HIV
	url += "&dimension=co&filter=pe:"+period+"&filter=ou:"+selectedOrgUnit+"&displayProperty=NAME&outputIdScheme=NAME";
	
	// Extract the data based on the above url
	$.getJSON(url).done(cohortData => {
		var data = [];
		var headers = cohortData.headers;
		var meta = cohortData.metaData.items;
		
		// process data, array to key => value json for easy interpretation and use
		$.each(cohortData.rows, function(i, row){
			var temp = {};
			$.each(row, function(j, col){
				if(headers[j].column == "Category option combo"){
					temp[headers[j].column] = meta[col].name;
				}else{
					temp[headers[j].column] = col;
				}
			});
			data.push(temp);
		});
		
		// read the configuration file to map the value and assign it to the proper input field
		var configUrl = "/hmisrest/tb-scripts/tb-outcome-config.json";
		$.getJSON(configUrl).done(configs => {
			$.each(configs, function(key, config){
				var value;
				if(Array.isArray(config.Data)){
					// if Data of the config has multiple items, the value for the data element is the sum of multiple data elements from previous period
					value = getSumOfValues(data, config);
				}else{
					// if the value of the item is from the single data element of the previous period
					value = getValue(data, config);
				}
				$("#"+key).val(value);
				
				// following line is required to enable auto update the value of the field on blur
				// uncomment for production use
				//$("#"+key).trigger("change");
			})
		});
	});	
	
	
	function getValue(data, config){
		var value = 0;
		$.each(data, function(i, d){
			// if the data item matches the Data field of the config,
			// and category option combo of data and config matches,
			// return the value
			if(d.Data == config.Data && d["Category option combo"] == config["Category option combo"]){
				value = parseInt(d.Value);
			}
		})
		return value;
	}
	
	function getSumOfValues(data, config){
		var value = 0;
		$.each(data, function(i, d){
			// if the data item matches the Data field of the config,
			// and category option combo of data and config matches,
			// return the sum of values
			if(config.Data.includes(d.Data) && d["Category option combo"] == config["Category option combo"]){
				value += parseInt(d.Value);
			}
		})
		return value;
	}
});