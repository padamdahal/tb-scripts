$(document).ready(function(){
	var selectedOrgUnit = selection.getSelected()[0];
	var selectedPeriod = $("#selectedPeriodId").val();
	var selectedPeriodYear = selectedPeriod.substring(0,4);
	var selectedPeriodMonth = selectedPeriod.substring(4,6);
	
	var periodYear = parseInt(selectedPeriodYear) - 1;
	var period = periodYear+selectedPeriodMonth;
	
	var url = "/hmis/api/29/analytics.json?dimension=dx:";
	url += "fEqA4AtMjJL;k26RPrXIpoo;gN5dGI91IcU;Vn2hxlC0kae;VJG7eqFdNFw;GyNhrvFPQaO;"; //PBC
	url += "wn7uqOYMdca;VAT9uMm4nmr;xVkVMUdLQ6I;PhcKMCuqZhT;hUFnA75Fp9R;"; // PCD
	url += "RFALSJwSpmd;Y1i5hgjTImc;igiGrm5xZlX;wfjQWicPkkd;GktEjOoQRGM;"; // EP
	url += "U3Zj0k3A9Wc"; //HIV
	url += "&dimension=co&filter=pe:"+period+"&filter=ou:"+selectedOrgUnit+"&displayProperty=NAME&outputIdScheme=NAME";
	
	$.getJSON(url).done(cohortData => {
		var data = [];
		var headers = cohortData.headers;
		var meta = cohortData.metaData.items;
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
		
		var configUrl = "/hmisrest/tb-scripts/tb-outcome-config.json";
		$.getJSON(configUrl).done(configs => {
			$.each(configs, function(key, config){
				var value;
				if(Array.isArray(config.Data)){
					value = getSumOfValues(data, config);
				}else{
					value = getValue(data, config);
				}
				$("#"+key).val(value);
				//$("#"+key).trigger("change");
			})
		});
	});	

	function getValue(data, config){
		var value = 0;
		$.each(data, function(i, d){
			if(d.Data == config.Data && d["Category option combo"] == config["Category option combo"]){
				value = parseInt(d.Value);
			}
		})
		return value;
	}
	
	function getSumOfValues(data, config){
		var value = 0;
		$.each(data, function(i, d){
			if(config.Data.includes(d.Data) && d["Category option combo"] == config["Category option combo"]){
				value += parseInt(d.Value);
			}
		})
		return value;
	}
});