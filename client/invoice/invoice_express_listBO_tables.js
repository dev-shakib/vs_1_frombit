import {SalesBoardService} from '../js/sales-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {InvoiceService} from "../invoice/invoice-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.invoicelistBO.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
});

Template.invoicelistBO.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let accountService = new AccountService();
    let salesService = new SalesBoardService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];
    if(FlowRouter.current().queryParams.success){
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
        onChangeMonthYear: function(year, month, inst){
        // Set date to picker
        $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
        // Hide (close) the picker
        // $(this).datepicker('hide');
        // // Change ttrigger the on change function
        // $(this).trigger('change');
       }
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblInvoicelistBO', function(error, result){
        if(error){

        }else{
            if(result){
                for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split('.')[1];
                    let columnWidth = customcolumn[i].width;
                    // let columnindex = customcolumn[i].index + 1;
                    $("th."+columnClass+"").html(columData);
                    $("th."+columnClass+"").css('width',""+columnWidth+"px");

                }
            }

        }
    });

    function MakeNegative() {
        $('td').each(function(){
            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
        });

        $('td.colStatus').each(function(){
            if($(this).text() == "Deleted") $(this).addClass('text-deleted');
            if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
            if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
            if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
        });
    };

    templateObject.resetData = function (dataVal) {
        window.open('/invoicelistBO?page=last','_self');
    }

    templateObject.getAllSalesOrderData = function () {

      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = (currentBeginDate.getMonth() + 1);
      let fromDateDay = currentBeginDate.getDate();
      if ((currentBeginDate.getMonth() + 1) < 10) {
          fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
      } else {
          fromDateMonth = (currentBeginDate.getMonth() + 1);
      }

      if (currentBeginDate.getDate() < 10) {
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        getVS1Data('TSalesBackOrderReport').then(function (dataObject) {
            if(dataObject.length == 0){
                sideBarService.getAllTSalesBackOrderReportData(prevMonth11Date,toDate, false,initialReportLoad,0).then(function (data) {
                  addVS1Data('TSalesBackOrderReport',JSON.stringify(data));
                    let lineItems = [];
                    let lineItemObj = {};

                    if (data.Params.IgnoreDates == true) {
                        $('#dateFrom').attr('readonly', true);
                        $('#dateTo').attr('readonly', true);
                        FlowRouter.go('/invoicelistBO?ignoredate=true');
                    } else {
                        $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                        $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                    }
                    for(let i=0; i<data.tinvoicelist.length; i++){
                      let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].TotalAmount) || 0.00;
                      let totalTax = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].TotalTax) || 0.00;
                      // Currency+''+data.tinvoiceex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                      let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].TotalAmountInc) || 0.00;
                      let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].Payment) || 0.00;
                      let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].Balance) || 0.00;
                      let productCost = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].LineCost)|| 0.00;
                      let salestatus = data.tinvoicelist[i].QuoteStatus || '';
                      if(data.tinvoicelist[i].Deleted == true){
                        salestatus = "Deleted";
                      }else if(data.tinvoicelist[i].CustomerName == ''){
                        salestatus = "Deleted";
                      };
                        var dataList = {
                            id: data.tinvoicelist[i].SaleID || '',
                            employee:data.tinvoicelist[i].EmployeeName || '',
                            sortdate: data.tinvoicelist[i].SaleDate !=''? moment(data.tinvoicelist[i].SaleDate).format("YYYY/MM/DD"): data.tinvoicelist[i].SaleDate,
                            saledate: data.tinvoicelist[i].SaleDate !=''? moment(data.tinvoicelist[i].SaleDate).format("DD/MM/YYYY"): data.tinvoicelist[i].SaleDate,
                            duedate: data.tinvoicelist[i].DueDate !=''? moment(data.tinvoicelist[i].DueDate).format("DD/MM/YYYY"): data.tinvoicelist[i].DueDate,
                            customername: data.tinvoicelist[i].CustomerName || '',

                            productname: data.tinvoicelist[i].ProductName || '',
                            saledesc: data.tinvoicelist[i].Product_Description || '',
                            etasortdate:data.tinvoicelist[i].ETADate !=''? moment(data.tinvoicelist[i].ETADate).format("YYYY/MM/DD"): data.tinvoicelist[i].ETADate,
                            etadate: data.tinvoicelist[i].ETADate !=''? moment(data.tinvoicelist[i].ETADate).format("DD/MM/YYYY"): data.tinvoicelist[i].ETADate,
                            customerjob: data.tinvoicelist[i].CustomerJob || '',
                            qtybackorder: data.tinvoicelist[i].BackOrder || 0,
                            originalqty: data.tinvoicelist[i].BackOrder || 0,
                            prodcost: productCost,

                            totalamountex: totalAmountEx || 0.00,
                            totaltax: 0.00 || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            department: data.tinvoicelist[i].class || '',
                            custfield1: data.tinvoicelist[i].UOM || '',
                            custfield2: data.tinvoicelist[i].SaleTerms || '',
                            comments: data.tinvoicelist[i].PickMemo || '',
                            qtybackorder: data.tinvoicelist[i].BackOrder || '',
                            product: data.tinvoicelist[i].ProductName || '',
                            salestatus: salestatus || '',
                            // shipdate:data.tinvoicelist[i].ShipDate !=''? moment(data.tinvoicelist[i].ShipDate).format("DD/MM/YYYY"): data.tinvoicelist[i].ShipDate,

                        };

                        //if(data.tinvoicelist[i].IsBackOrder == true){
                        dataTableList.push(dataList);
                        //}
                        //}
                    }

                    templateObject.datatablerecords.set(dataTableList);

                    if(templateObject.datatablerecords.get()){

                        Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblInvoicelistBO', function(error, result){
                            if(error){

                            }else{
                                if(result){
                                    for (let i = 0; i < result.customFields.length; i++) {
                                        let customcolumn = result.customFields;
                                        let columData = customcolumn[i].label;
                                        let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                        let hiddenColumn = customcolumn[i].hidden;
                                        let columnClass = columHeaderUpdate.split('.')[1];
                                        let columnWidth = customcolumn[i].width;
                                        let columnindex = customcolumn[i].index + 1;

                                        if(hiddenColumn == true){

                                            $("."+columnClass+"").addClass('hiddenColumn');
                                            $("."+columnClass+"").removeClass('showColumn');
                                        }else if(hiddenColumn == false){
                                            $("."+columnClass+"").removeClass('hiddenColumn');
                                            $("."+columnClass+"").addClass('showColumn');
                                        }

                                    }
                                }

                            }
                        });


                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }

                    $('.fullScreenSpin').css('display','none');
                    setTimeout(function () {
                        $('#tblInvoicelistBO').DataTable({
                            columnDefs: [
                                {type: 'date', targets: 0}
                            ],
                            "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    text: '',
                                    download: 'open',
                                    className: "btntabletocsv hiddenColumn",
                                    filename: "Invoice List Back Order"+ moment().format(),
                                    orientation:'portrait',
                                    exportOptions: {
                                        columns: ':visible',
                                        format: {
                                            body: function ( data, row, column ) {
                                                if(data.includes("</span>")){
                                                    var res = data.split("</span>");
                                                    data = res[1];
                                                }

                                                return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                            }
                                        }
                                    }
                                },{
                                    extend: 'print',
                                    download: 'open',
                                    className: "btntabletopdf hiddenColumn",
                                    text: '',
                                    title: 'Invoice List',
                                    filename: "Invoice List Back Order"+ moment().format(),
                                    exportOptions: {
                                        columns: ':visible',
                                        stripHtml: false
                                    }
                                }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: initialDatatableLoad,
                            "bLengthChange": false,
                            info: true,
                            responsive: true,
                            "order": [[ 0, "desc" ],[ 2, "desc" ]],
                            action: function () {
                                $('#tblInvoicelistBO').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function (oSettings) {
                              let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
                              $('.paginate_button.page-item').removeClass('disabled');
                              $('#tblInvoicelistBO_ellipsis').addClass('disabled');

                              if(oSettings._iDisplayLength == -1){
                                if(oSettings.fnRecordsDisplay() > 150){
                                  $('.paginate_button.page-item.previous').addClass('disabled');
                                  $('.paginate_button.page-item.next').addClass('disabled');
                                }
                              }else{

                              }
                              if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                                  $('.paginate_button.page-item.next').addClass('disabled');
                              }

                              $('.paginate_button.next:not(.disabled)', this.api().table().container())
                               .on('click', function(){
                                 $('.fullScreenSpin').css('display','inline-block');
                                 let dataLenght = oSettings._iDisplayLength;
                                 var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                 var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                 let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                 let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                 if(checkurlIgnoreDate == 'true'){
                                 sideBarService.getAllTSalesBackOrderReportData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                   getVS1Data('TSalesBackOrderReport').then(function (dataObjectold) {
                                     if(dataObjectold.length == 0){

                                     }else{
                                       let dataOld = JSON.parse(dataObjectold[0].data);

                                       var thirdaryData = $.merge($.merge([], dataObjectnew.tsalesbackorderreport), dataOld.tsalesbackorderreport);
                                       let objCombineData = {
                                         tsalesbackorderreport:thirdaryData
                                       }


                                         addVS1Data('TSalesBackOrderReport',JSON.stringify(objCombineData)).then(function (datareturn) {
                                           templateObject.resetData(objCombineData);
                                         $('.fullScreenSpin').css('display','none');
                                         }).catch(function (err) {
                                         $('.fullScreenSpin').css('display','none');
                                         });

                                     }
                                    }).catch(function (err) {

                                    });

                                 }).catch(function(err) {
                                   $('.fullScreenSpin').css('display','none');
                                 });
                               }else{
                                 sideBarService.getAllTSalesBackOrderReportData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                   getVS1Data('TSalesBackOrderReport').then(function (dataObjectold) {
                                     if(dataObjectold.length == 0){

                                     }else{
                                       let dataOld = JSON.parse(dataObjectold[0].data);

                                       var thirdaryData = $.merge($.merge([], dataObjectnew.tsalesbackorderreport), dataOld.tsalesbackorderreport);
                                       let objCombineData = {
                                         tsalesbackorderreport:thirdaryData
                                       }


                                         addVS1Data('TSalesBackOrderReport',JSON.stringify(objCombineData)).then(function (datareturn) {
                                           templateObject.resetData(objCombineData);
                                         $('.fullScreenSpin').css('display','none');
                                         }).catch(function (err) {
                                         $('.fullScreenSpin').css('display','none');
                                         });

                                     }
                                    }).catch(function (err) {

                                    });

                                 }).catch(function(err) {
                                   $('.fullScreenSpin').css('display','none');
                                 });
                               }
                               });
                                setTimeout(function () {
                                    MakeNegative();
                                }, 100);
                            },
                            "fnInitComplete": function () {
                              let urlParametersPage = FlowRouter.current().queryParams.page;
                              if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                                  this.fnPageChange('last');
                              }
                                 $("<button class='btn btn-primary btnRefreshInvoiceListBO' type='button' id='btnRefreshInvoiceListBO' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInvoicelistBO_filter");
                                 $('.myvarFilterForm').appendTo(".colDateFilter");
                             },
                             "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                               let countTableData = data.Params.Count || 0; //get count from API data

                                 return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                             }

                        }).on('page', function () {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function () {

                        });

                        // $('#tblInvoicelistBO').DataTable().column( 0 ).visible( true );
                        $('.fullScreenSpin').css('display','none');
                    }, 0);

                    var columns = $('#tblInvoicelistBO th');
                    let sTible = "";
                    let sWidth = "";
                    let sIndex = "";
                    let sVisible = "";
                    let columVisible = false;
                    let sClass = "";
                    $.each(columns, function(i,v) {
                        if(v.hidden == false){
                            columVisible =  true;
                        }
                        if((v.className.includes("hiddenColumn"))){
                            columVisible = false;
                        }
                        sWidth = v.style.width.replace('px', "");

                        let datatablerecordObj = {
                            sTitle: v.innerText || '',
                            sWidth: sWidth || '',
                            sIndex: v.cellIndex || '',
                            sVisible: columVisible || false,
                            sClass: v.className || ''
                        };
                        tableHeaderList.push(datatablerecordObj);
                    });
                    templateObject.tableheaderrecords.set(tableHeaderList);
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    $('#tblInvoicelistBO tbody').on( 'click', 'tr', function () {
                        var listData = $(this).closest('tr').attr('id');
                        var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                        if(listData){
                          if(checkDeleted == "Deleted"){
                            swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                          }else{
                            FlowRouter.go('/invoicecard?id=' + listData);
                          }
                        }

                    });

                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display','none');
                    // Meteor._reload.reload();
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tinvoicelist;
                let lineItems = [];
                let lineItemObj = {};
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                    FlowRouter.go('/invoicelistBO?ignoredate=true');
                } else {
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }
                for(let i=0; i<data.tinvoicelist.length; i++){
                  let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].TotalAmount) || 0.00;
                  let totalTax = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].TotalTax) || 0.00;
                  // Currency+''+data.tinvoiceex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                  let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].TotalAmountInc) || 0.00;
                  let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].Payment) || 0.00;
                  let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].Balance) || 0.00;
                  let productCost = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].LineCost)|| 0.00;
                  let salestatus = data.tinvoicelist[i].QuoteStatus || '';
                  if(data.tinvoicelist[i].Deleted == true){
                    salestatus = "Deleted";
                  }else if(data.tinvoicelist[i].CustomerName == ''){
                    salestatus = "Deleted";
                  };
                    var dataList = {
                        id: data.tinvoicelist[i].SaleID || '',
                        employee:data.tinvoicelist[i].EmployeeName || '',
                        sortdate: data.tinvoicelist[i].SaleDate !=''? moment(data.tinvoicelist[i].SaleDate).format("YYYY/MM/DD"): data.tinvoicelist[i].SaleDate,
                        saledate: data.tinvoicelist[i].SaleDate !=''? moment(data.tinvoicelist[i].SaleDate).format("DD/MM/YYYY"): data.tinvoicelist[i].SaleDate,
                        duedate: data.tinvoicelist[i].DueDate !=''? moment(data.tinvoicelist[i].DueDate).format("DD/MM/YYYY"): data.tinvoicelist[i].DueDate,
                        customername: data.tinvoicelist[i].CustomerName || '',

                        productname: data.tinvoicelist[i].ProductName || '',
                        saledesc: data.tinvoicelist[i].Product_Description || '',
                        etasortdate:data.tinvoicelist[i].ETADate !=''? moment(data.tinvoicelist[i].ETADate).format("YYYY/MM/DD"): data.tinvoicelist[i].ETADate,
                        etadate: data.tinvoicelist[i].ETADate !=''? moment(data.tinvoicelist[i].ETADate).format("DD/MM/YYYY"): data.tinvoicelist[i].ETADate,
                        customerjob: data.tinvoicelist[i].CustomerJob || '',
                        qtybackorder: data.tinvoicelist[i].BackOrder || 0,
                        originalqty: data.tinvoicelist[i].BackOrder || 0,
                        prodcost: productCost,

                        totalamountex: totalAmountEx || 0.00,
                        totaltax: 0.00 || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        department: data.tinvoicelist[i].class || '',
                        custfield1: data.tinvoicelist[i].UOM || '',
                        custfield2: data.tinvoicelist[i].SaleTerms || '',
                        comments: data.tinvoicelist[i].PickMemo || '',
                        qtybackorder: data.tinvoicelist[i].BackOrder || '',
                        product: data.tinvoicelist[i].ProductName || '',
                        salestatus: salestatus || '',
                        // shipdate:data.tinvoicelist[i].ShipDate !=''? moment(data.tinvoicelist[i].ShipDate).format("DD/MM/YYYY"): data.tinvoicelist[i].ShipDate,

                    };

                    //if(data.tinvoicelist[i].IsBackOrder == true){
                    dataTableList.push(dataList);
                    //}
                    //}
                }

                templateObject.datatablerecords.set(dataTableList);

                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblInvoicelistBO', function(error, result){
                        if(error){

                        }else{
                            if(result){
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if(hiddenColumn == true){

                                        $("."+columnClass+"").addClass('hiddenColumn');
                                        $("."+columnClass+"").removeClass('showColumn');
                                    }else if(hiddenColumn == false){
                                        $("."+columnClass+"").removeClass('hiddenColumn');
                                        $("."+columnClass+"").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });


                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display','none');
                setTimeout(function () {
                    $('#tblInvoicelistBO').DataTable({
                        columnDefs: [
                            {type: 'date', targets: 0}
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Invoice List Back Order"+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible',
                                    format: {
                                        body: function ( data, row, column ) {
                                            if(data.includes("</span>")){
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                        }
                                    }
                                }
                            },{
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Invoice List',
                                filename: "Invoice List Back Order"+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialDatatableLoad,
                        "bLengthChange": false,
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        action: function () {
                            $('#tblInvoicelistBO').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblInvoicelistBO_ellipsis').addClass('disabled');

                          if(oSettings._iDisplayLength == -1){
                            if(oSettings.fnRecordsDisplay() > 150){
                              $('.paginate_button.page-item.previous').addClass('disabled');
                              $('.paginate_button.page-item.next').addClass('disabled');
                            }
                          }else{

                          }
                          if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                           .on('click', function(){
                             $('.fullScreenSpin').css('display','inline-block');
                             let dataLenght = oSettings._iDisplayLength;
                             var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                             var dateTo = new Date($("#dateTo").datepicker("getDate"));

                             let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                             let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                             if(checkurlIgnoreDate == 'true'){
                             sideBarService.getAllTSalesBackOrderReportData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TSalesBackOrderReport').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tsalesbackorderreport), dataOld.tsalesbackorderreport);
                                   let objCombineData = {
                                     tsalesbackorderreport:thirdaryData
                                   }


                                     addVS1Data('TSalesBackOrderReport',JSON.stringify(objCombineData)).then(function (datareturn) {
                                       templateObject.resetData(objCombineData);
                                     $('.fullScreenSpin').css('display','none');
                                     }).catch(function (err) {
                                     $('.fullScreenSpin').css('display','none');
                                     });

                                 }
                                }).catch(function (err) {

                                });

                             }).catch(function(err) {
                               $('.fullScreenSpin').css('display','none');
                             });
                           }else{
                             sideBarService.getAllTSalesBackOrderReportData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TSalesBackOrderReport').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tsalesbackorderreport), dataOld.tsalesbackorderreport);
                                   let objCombineData = {
                                     tsalesbackorderreport:thirdaryData
                                   }


                                     addVS1Data('TSalesBackOrderReport',JSON.stringify(objCombineData)).then(function (datareturn) {
                                       templateObject.resetData(objCombineData);
                                     $('.fullScreenSpin').css('display','none');
                                     }).catch(function (err) {
                                     $('.fullScreenSpin').css('display','none');
                                     });

                                 }
                                }).catch(function (err) {

                                });

                             }).catch(function(err) {
                               $('.fullScreenSpin').css('display','none');
                             });
                           }
                           });
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                          let urlParametersPage = FlowRouter.current().queryParams.page;
                          if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                              this.fnPageChange('last');
                          }
                             $("<button class='btn btn-primary btnRefreshInvoiceListBO' type='button' id='btnRefreshInvoiceListBO' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInvoicelistBO_filter");
                             $('.myvarFilterForm').appendTo(".colDateFilter");
                         },
                         "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                           let countTableData = data.Params.Count || 0; //get count from API data

                             return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                         }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    });

                    // $('#tblInvoicelistBO').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display','none');
                }, 0);

                var columns = $('#tblInvoicelistBO th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i,v) {
                    if(v.hidden == false){
                        columVisible =  true;
                    }
                    if((v.className.includes("hiddenColumn"))){
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || '',
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblInvoicelistBO tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                    if(listData){
                      if(checkDeleted == "Deleted"){
                        swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                      }else{
                       window.open('/invoicecard?id=' + listData+'&type=bo','_self');
                      }
                    }

                });

            }
        }).catch(function (err) {
              sideBarService.getAllTSalesBackOrderReportData(prevMonth11Date,toDate, false,initialReportLoad,0).then(function (data) {
                addVS1Data('TSalesBackOrderReport',JSON.stringify(data));
                let lineItems = [];
                let lineItemObj = {};

                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                    FlowRouter.go('/invoicelistBO?ignoredate=true');
                } else {
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }
                for(let i=0; i<data.tinvoicelist.length; i++){
                  let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].TotalAmount) || 0.00;
                  let totalTax = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].TotalTax) || 0.00;
                  // Currency+''+data.tinvoiceex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                  let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].TotalAmountInc) || 0.00;
                  let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].Payment) || 0.00;
                  let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].Balance) || 0.00;
                  let productCost = utilityService.modifynegativeCurrencyFormat(data.tinvoicelist[i].LineCost)|| 0.00;
                  let salestatus = data.tinvoicelist[i].QuoteStatus || '';
                  if(data.tinvoicelist[i].Deleted == true){
                    salestatus = "Deleted";
                  }else if(data.tinvoicelist[i].CustomerName == ''){
                    salestatus = "Deleted";
                  };
                    var dataList = {
                        id: data.tinvoicelist[i].SaleID || '',
                        employee:data.tinvoicelist[i].EmployeeName || '',
                        sortdate: data.tinvoicelist[i].SaleDate !=''? moment(data.tinvoicelist[i].SaleDate).format("YYYY/MM/DD"): data.tinvoicelist[i].SaleDate,
                        saledate: data.tinvoicelist[i].SaleDate !=''? moment(data.tinvoicelist[i].SaleDate).format("DD/MM/YYYY"): data.tinvoicelist[i].SaleDate,
                        duedate: data.tinvoicelist[i].DueDate !=''? moment(data.tinvoicelist[i].DueDate).format("DD/MM/YYYY"): data.tinvoicelist[i].DueDate,
                        customername: data.tinvoicelist[i].CustomerName || '',

                        productname: data.tinvoicelist[i].ProductName || '',
                        saledesc: data.tinvoicelist[i].Product_Description || '',
                        etasortdate:data.tinvoicelist[i].ETADate !=''? moment(data.tinvoicelist[i].ETADate).format("YYYY/MM/DD"): data.tinvoicelist[i].ETADate,
                        etadate: data.tinvoicelist[i].ETADate !=''? moment(data.tinvoicelist[i].ETADate).format("DD/MM/YYYY"): data.tinvoicelist[i].ETADate,
                        customerjob: data.tinvoicelist[i].CustomerJob || '',
                        qtybackorder: data.tinvoicelist[i].BackOrder || 0,
                        originalqty: data.tinvoicelist[i].BackOrder || 0,
                        prodcost: productCost,

                        totalamountex: totalAmountEx || 0.00,
                        totaltax: 0.00 || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        department: data.tinvoicelist[i].class || '',
                        custfield1: data.tinvoicelist[i].UOM || '',
                        custfield2: data.tinvoicelist[i].SaleTerms || '',
                        comments: data.tinvoicelist[i].PickMemo || '',
                        qtybackorder: data.tinvoicelist[i].BackOrder || '',
                        product: data.tinvoicelist[i].ProductName || '',
                        salestatus: salestatus || '',
                        // shipdate:data.tinvoicelist[i].ShipDate !=''? moment(data.tinvoicelist[i].ShipDate).format("DD/MM/YYYY"): data.tinvoicelist[i].ShipDate,

                    };

                    //if(data.tinvoicelist[i].IsBackOrder == true){
                    dataTableList.push(dataList);
                    //}
                    //}
                }

                templateObject.datatablerecords.set(dataTableList);

                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblInvoicelistBO', function(error, result){
                        if(error){

                        }else{
                            if(result){
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if(hiddenColumn == true){

                                        $("."+columnClass+"").addClass('hiddenColumn');
                                        $("."+columnClass+"").removeClass('showColumn');
                                    }else if(hiddenColumn == false){
                                        $("."+columnClass+"").removeClass('hiddenColumn');
                                        $("."+columnClass+"").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });


                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display','none');
                setTimeout(function () {
                    $('#tblInvoicelistBO').DataTable({
                        columnDefs: [
                            {type: 'date', targets: 0}
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Invoice List Back Order"+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible',
                                    format: {
                                        body: function ( data, row, column ) {
                                            if(data.includes("</span>")){
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                        }
                                    }
                                }
                            },{
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Invoice List',
                                filename: "Invoice List Back Order"+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialDatatableLoad,
                        "bLengthChange": false,
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        action: function () {
                            $('#tblInvoicelistBO').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblInvoicelistBO_ellipsis').addClass('disabled');

                          if(oSettings._iDisplayLength == -1){
                            if(oSettings.fnRecordsDisplay() > 150){
                              $('.paginate_button.page-item.previous').addClass('disabled');
                              $('.paginate_button.page-item.next').addClass('disabled');
                            }
                          }else{

                          }
                          if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                           .on('click', function(){
                             $('.fullScreenSpin').css('display','inline-block');
                             let dataLenght = oSettings._iDisplayLength;
                             var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                             var dateTo = new Date($("#dateTo").datepicker("getDate"));

                             let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                             let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                             if(checkurlIgnoreDate == 'true'){
                             sideBarService.getAllTSalesBackOrderReportData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TSalesBackOrderReport').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tsalesbackorderreport), dataOld.tsalesbackorderreport);
                                   let objCombineData = {
                                     tsalesbackorderreport:thirdaryData
                                   }


                                     addVS1Data('TSalesBackOrderReport',JSON.stringify(objCombineData)).then(function (datareturn) {
                                       templateObject.resetData(objCombineData);
                                     $('.fullScreenSpin').css('display','none');
                                     }).catch(function (err) {
                                     $('.fullScreenSpin').css('display','none');
                                     });

                                 }
                                }).catch(function (err) {

                                });

                             }).catch(function(err) {
                               $('.fullScreenSpin').css('display','none');
                             });
                           }else{
                             sideBarService.getAllTSalesBackOrderReportData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TSalesBackOrderReport').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tsalesbackorderreport), dataOld.tsalesbackorderreport);
                                   let objCombineData = {
                                     tsalesbackorderreport:thirdaryData
                                   }


                                     addVS1Data('TSalesBackOrderReport',JSON.stringify(objCombineData)).then(function (datareturn) {
                                       templateObject.resetData(objCombineData);
                                     $('.fullScreenSpin').css('display','none');
                                     }).catch(function (err) {
                                     $('.fullScreenSpin').css('display','none');
                                     });

                                 }
                                }).catch(function (err) {

                                });

                             }).catch(function(err) {
                               $('.fullScreenSpin').css('display','none');
                             });
                           }
                           });
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                          let urlParametersPage = FlowRouter.current().queryParams.page;
                          if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                              this.fnPageChange('last');
                          }
                             $("<button class='btn btn-primary btnRefreshInvoiceListBO' type='button' id='btnRefreshInvoiceListBO' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInvoicelistBO_filter");
                             $('.myvarFilterForm').appendTo(".colDateFilter");
                         },
                         "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                           let countTableData = data.Params.Count || 0; //get count from API data

                             return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                         }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    });

                    // $('#tblInvoicelistBO').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display','none');
                }, 0);

                var columns = $('#tblInvoicelistBO th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i,v) {
                    if(v.hidden == false){
                        columVisible =  true;
                    }
                    if((v.className.includes("hiddenColumn"))){
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || '',
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblInvoicelistBO tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                    if(listData){
                      if(checkDeleted == "Deleted"){
                        swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                      }else{
                        FlowRouter.go('/invoicecard?id=' + listData);
                      }
                    }

                });

            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
        });

    }

    templateObject.getAllSalesOrderData();

    $('#tblInvoicelistBO tbody').on( 'click', 'tr', function () {
        var listData = $(this).closest('tr').attr('id');
        var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
        if(listData){
          if(checkDeleted == "Deleted"){
            swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
          }else{
            FlowRouter.go('/invoicecard?id=' + listData);
          }
        }

    });


    templateObject.getAllFilterBOInvoiceData = function(fromDate, toDate, ignoreDate) {
        sideBarService.getAllTSalesBackOrderReportData(fromDate, toDate, ignoreDate,initialReportLoad,0).then(function(data) {
            addVS1Data('TSalesBackOrderReport', JSON.stringify(data)).then(function(datareturn) {
                window.open('/invoicelistBO?toDate=' + toDate + '&fromDate=' + fromDate + '&ignoredate=' + ignoreDate, '_self');
            }).catch(function(err) {
                location.reload();
            });
        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    }

    let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
    let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
    let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    if (urlParametersDateFrom) {
        if (urlParametersIgnoreDate == true) {
            $('#dateFrom').attr('readonly', true);
            $('#dateTo').attr('readonly', true);
        } else {

            $("#dateFrom").val(urlParametersDateFrom != '' ? moment(urlParametersDateFrom).format("DD/MM/YYYY") : urlParametersDateFrom);
            $("#dateTo").val(urlParametersDateTo != '' ? moment(urlParametersDateTo).format("DD/MM/YYYY") : urlParametersDateTo);
        }
    }
});


Template.invoicelistBO.events({
    'click #btnNewInvoice':function(event){
        FlowRouter.go('/invoicecard');
    },
    'click #btnInvoiceList':function(event){
        FlowRouter.go('/invoicelist');
    },
    'click .chkDatatable' : function(event){
        var columns = $('#tblInvoicelistBO th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function(i,v) {
            let className = v.classList;
            let replaceClass = className[1];

            if(v.innerText == columnDataValue){
                if($(event.target).is(':checked')){
                    $("."+replaceClass+"").css('display','table-cell');
                    $("."+replaceClass+"").css('padding','.75rem');
                    $("."+replaceClass+"").css('vertical-align','top');
                }else{
                    $("."+replaceClass+"").css('display','none');
                }
            }
        });
    },
    'keyup #tblInvoicelistBO_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshInvoiceListBO").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshInvoiceListBO").removeClass('btnSearchAlert');
          }
          if (event.keyCode == 13) {
             $(".btnRefreshInvoiceListBO").trigger("click");
          }
        },
        'blur #tblInventory_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshInvoiceListBO").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshInvoiceListBO").removeClass('btnSearchAlert');
          }

        },
    'click .btnRefreshInvoiceListBO':function(event){
         let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblInvoicelistBO_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewInvoiceBoByNameOrID(dataSearchName).then(function (data) {
                $(".btnRefreshInvoiceListBO").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.BackOrderSalesList.length > 0) {
                    for (let i = 0; i < data.BackOrderSalesList.length; i++) {
                         let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.BackOrderSalesList[i].TotalAmountEx)|| 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.BackOrderSalesList[i].TotalTax) || 0.00;
                        // Currency+''+data.tinvoiceex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.BackOrderSalesList[i].TotalAmountInc) || 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.BackOrderSalesList[i].TotalAmountInc) || 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.BackOrderSalesList[i].TotalAmountInc) || 0.00;
                        var dataList = {
                           id: data.BackOrderSalesList[i].SaleID || '',
                            employee:data.BackOrderSalesList[i].SaleEnteredBy || '',
                            sortdate: data.BackOrderSalesList[i].SaleDate !=''? moment(data.BackOrderSalesList[i].SaleDate).format("YYYY/MM/DD"): data.BackOrderSalesList[i].SaleDate,
                            saledate: data.BackOrderSalesList[i].SaleDate !=''? moment(data.BackOrderSalesList[i].SaleDate).format("DD/MM/YYYY"): data.BackOrderSalesList[i].SaleDate,
                            duedate: data.BackOrderSalesList[i].SaleDueDate !=''? moment(data.BackOrderSalesList[i].SaleDueDate).format("DD/MM/YYYY"): data.BackOrderSalesList[i].SaleDueDate,
                            customername: data.BackOrderSalesList[i].CustomerPrintName || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            department: data.BackOrderSalesList[i].Department || '',
                            salestatus:  '',
                            custfield1: data.BackOrderSalesList[i].UOM || '',
                            custfield2: data.BackOrderSalesList[i].SaleTerms || '',
                            comments: data.BackOrderSalesList[i].SaleComments || '',
                            qtybackorder: data.BackOrderSalesList[i].QtyBackOrder || '',
                            product: data.BackOrderSalesList[i].ProductPrintName || '',

                        };

                        //if(data.tinvoiceex[i].fields.Deleted == false){
                        //splashArrayInvoiceList.push(dataList);
                        dataTableList.push(dataList);
                        //}


                        //}
                    }
                    templateObject.datatablerecords.set(dataTableList);

                    let item = templateObject.datatablerecords.get();
                    $('.fullScreenSpin').css('display', 'none');
                    if (dataTableList) {
                        var datatable = $('#tblInvoicelistBO').DataTable();
                        $("#tblInvoicelistBO > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblInvoicelistBO > tbody").append(
                                ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colSortDate hiddenColumn">' + item[x].sortdate + '</td>' +
                                '<td contenteditable="false" class="colSaleDate" ><span style="display:none;">' + item[x].sortdate + '</span>' + item[x].saledate + '</td>' +
                                '<td contenteditable="false" class="colSalesNo">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colDueDate" >' + item[x].duedate + '</td>' +
                                '<td contenteditable="false" class="colCustomer">' + item[x].customername + '</td>' +
                                '<td contenteditable="false" class="colAmountEx" style="text-align: right!important;">' + item[x].totalamountex + '</td>' +
                                '<td contenteditable="false" class="colTax hiddenColumn" style="text-align: right!important;">' + item[x].totaltax + '</td>' +
                                '<td contenteditable="false" class="colAmount" style="text-align: right!important;">' + item[x].totalamount + '</td>' +
                                '<td contenteditable="false" class="colProduct">' + item[x].product + '</td>' +
                                '<td contenteditable="false" class="colBalanceOutstanding" style="text-align: right!important;">' + item[x].qtybackorder + '</td>' +
                                '<td contenteditable="false" class="colStatus">' + item[x].salestatus + '</td>' +
                                '<td contenteditable="false" class="colSaleCustField1 hiddenColumn">' + item[x].custfield1 + '</td>' +
                                '<td contenteditable="false" class="colSaleCustField2 hiddenColumn">' + item[x].custfield2 + '</td>' +
                                '<td contenteditable="false" class="colEmployee hiddenColumn">' + item[x].employee + '</td>' +
                                '<td contenteditable="false" class="colComments">' + item[x].comments + '</td>' +
                                '</tr>');


                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.tinvoicelist.length + ' of ' + data.tinvoicelist.length + ' entries');

                    }

                } else {
                    $('.fullScreenSpin').css('display', 'none');

                    swal({
                        title: 'Question',
                        text: "Invoice does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/invoicecard');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {

          $(".btnRefresh").trigger("click");
        }
    },
    'click .resetTable' : function(event){
        var getcurrentCloudDetails = CloudUser.findOne({_id:Session.get('mycloudLogonID'),clouddatabaseID:Session.get('mycloudLogonDBID')});
        if(getcurrentCloudDetails){
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblInvoicelistBO'});
                if (checkPrefDetails) {
                    CloudPreference.remove({_id:checkPrefDetails._id}, function(err, idTag) {
                        if (err) {

                        }else{
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable' : function(event){
        let lineItems = [];
        $('#myModal2').modal('toggle');

    },
    'blur .divcolumn' : function(event){
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        var datable = $('#tblInvoicelistBO').DataTable();
        var title = datable.column( columnDatanIndex ).header();
        $(title).html(columData);

    },
    'change .rngRange' : function(event){
        let range = $(event.target).val();
        $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblInvoicelistBO th');
        $.each(datable, function(i,v) {

            if(v.innerText == columnDataValue){
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("."+replaceClass+"").css('width',range+'px');

            }
        });

    },
    'click .btnOpenSettings' : function(event){
        let templateObject = Template.instance();
        var columns = $('#tblInvoicelistBO th');

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i,v) {
            if(v.hidden == false){
                columVisible =  true;
            }
            if((v.className.includes("hiddenColumn"))){
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");

            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click #exportbtn': function () {
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblInvoicelistBO_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display','inline-block');
        let currentDate = new Date();
        let hours = currentDate.getHours(); //returns 0-23
        let minutes = currentDate.getMinutes(); //returns 0-59
        let seconds = currentDate.getSeconds(); //returns 0-59
        let month = (currentDate.getMonth()+1);
        let days = currentDate.getDate();

        if((currentDate.getMonth()+1) < 10){
            month = "0" + (currentDate.getMonth()+1);
        }

        if(currentDate.getDate() < 10){
            days = "0" + currentDate.getDate();
        }

        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");


        let currenctTodayDate = currentDate.getFullYear() + "-" + month + "-" + days + " "+ hours+ ":"+ minutes+ ":"+ seconds;
        let templateObject = Template.instance();
        sideBarService.getAllTSalesBackOrderReportData(prevMonth11Date,toDate, false,initialReportLoad,0).then(function (dataBO) {
          addVS1Data('TSalesBackOrderReport',JSON.stringify(dataBO)).then(function (datareturn) {
            sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function (data) {
                addVS1Data('TInvoiceEx', JSON.stringify(data)).then(function (datareturn) {
                    window.open('/invoicelistBO', '_self');
                }).catch(function (err) {
                    window.open('/invoicelistBO', '_self');
                });
            }).catch(function (err) {
                window.open('/invoicelistBO', '_self');
            });
          }).catch(function (err) {
            sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function (data) {
                addVS1Data('TInvoiceEx', JSON.stringify(data)).then(function (datareturn) {
                    window.open('/invoicelistBO', '_self');
                }).catch(function (err) {
                    window.open('/invoicelistBO', '_self');
                });
            }).catch(function (err) {
                window.open('/invoicelistBO', '_self');
            });
          });
        }).catch(function(err) {
            window.open('/invoicelistBO','_self');
        });

    },
    'change #dateTo': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterBOInvoiceData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    'change #dateFrom': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterBOInvoiceData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    'click #today': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterBOInvoiceData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastweek': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay - 7);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay -7)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterBOInvoiceData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastMonth': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();

        var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function(dateComponent) {
          return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function(date) {
          return  formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };

        var formatDateERP = function(date) {
          return  date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };


        var fromDate = formatDate(prevMonthFirstDate);
        var toDate = formatDate(prevMonthLastDate);

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);

        var getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.getAllFilterBOInvoiceData(getDateFrom, getLoadDate, false);
    },
    'click #lastQuarter': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        function getQuarter(d) {
            d = d || new Date();
            var m = Math.floor(d.getMonth() / 3) + 2;
            return m > 4 ? m - 4 : m;
        }

        var quarterAdjustment = (moment().month() % 3) + 1;
        var lastQuarterEndDate = moment().subtract({
            months: quarterAdjustment
        }).endOf('month');
        var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
            months: 2
        }).startOf('month');

        var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
        var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");


        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);

        let fromDateMonth = getQuarter(currentDate);
        var quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();

        var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getAllFilterBOInvoiceData(getDateFrom, getLoadDate, false);
    },
    'click #last12Months': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if ((currentDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentDate.getMonth() + 1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        if ((currentDate2.getMonth() + 1) < 10) {
            fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
        }
        if (currentDate2.getDate() < 10) {
            fromDateDay2 = "0" + currentDate2.getDate();
        }
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
        templateObject.getAllFilterBOInvoiceData(getDateFrom, getLoadDate, false);

    },
    'click #ignoreDate': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.getAllFilterBOInvoiceData('', '', true);
    },
    'click .printConfirm' : function(event){
        let values = [];
        let basedOnTypeStorages = Object.keys(localStorage);
        basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
            let employeeId = storage.split('_')[2];
            return storage.includes('BasedOnType_') && employeeId == Session.get('mySessionEmployeeLoggedID')
        });
        let i = basedOnTypeStorages.length;
        if (i > 0) {
            while (i--) {
                values.push(localStorage.getItem(basedOnTypeStorages[i]));
            }
        }
        values.forEach(value => {
            let reportData = JSON.parse(value);
            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
            if (reportData.BasedOnType.includes("P")) {
                if (reportData.FormID == 1) {
                    let formIds = reportData.FormIDs.split(',');
                    if (formIds.includes("54")) {
                        reportData.FormID = 54;
                        Meteor.call('sendNormalEmail', reportData);
                    }
                } else {
                    if (reportData.FormID == 54)
                        Meteor.call('sendNormalEmail', reportData);
                }
            }
        });

        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblInvoicelistBO_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
    }


});

Template.invoicelistBO.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.saledate == 'NA') {
                return 1;
            }
            else if (b.saledate == 'NA') {
                return -1;
            }
            return (a.saledate.toUpperCase() > b.saledate.toUpperCase()) ? 1 : -1;
            // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblInvoicelistBO'});
    }
});
