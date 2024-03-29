import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../../js/core-service";
import { DashBoardService } from "../../Dashboard/dashboard-service";
import { UtilityService } from "../../utility-service";
import { RateTypeService } from '../../js/ratetype_service';
import '../../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import { Random } from 'meteor/random';
import { jsPDF } from "jspdf";
import 'jQuery.print/jQuery.print.js';
import { autoTable } from "jspdf-autotable";
import 'jquery-editable-select';
import { SideBarService } from "../../js/sidebar-service";
import '../../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
var times = 0;

Template.grouplist.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.groupTypeList = new ReactiveVar([]);
});

Template.grouplist.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let tempObj = Template.instance();
    let sideBarService = new SideBarService();
    let utilityService = new UtilityService();
    let rateTypeService = new RateTypeService();
    let description = '';
    var splashArrayGroupTypeList = new Array(); 
    var currentLoc = FlowRouter.current().route.path;
   
    tempObj.getAllGroupType = function() {
        getVS1Data('TVs1TabGroups').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getNewGroupListVS1().then(function(data) {
                    let records = [];
                    let inventoryData = [];
                    addVS1Data('TVs1TabGroups',JSON.stringify(data));
                    console.log(data);
                    // for (let i = 0; i < data.tvs1tabgroups.length; i++) {
                    //    if (!isNaN(data.tvs1tabgroups[i].fields.Description)) {
                    //     description = data.tvs1tabgroups[i].fields.Description || '';
                    //   } else {
                    //     description = "";
                    //   }
                    //   var dataList = [                   
                    //   	data.tvs1tabgroups[i].fields.Description || '',                    
                    //   ];                 
                    //   splashArrayGroupTypeList.push(dataList);
                    // }
            
                    if(splashArrayGroupTypeList) {
                       $('#tblgrouplist').dataTable({
                            data: splashArrayGroupTypeList,
                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            columnDefs: [
                                { className: "thgroupDescription", "targets": [0] },                                     
                                { className: "thgroupID hiddenColumn", "targets": [1] }                              
                            ],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            pageLength: initialDatatableLoad,
                            lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                            info: true,
                            responsive: true,
                            "fnInitComplete": function () {
                              $("<button class='btn btn-primary btnAddGroupType' data-dismiss='modal' data-toggle='modal' data-target='#addGroupModel' type='button' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblgrouplist_filter");
                              $("<button class='btn btn-primary btnRefreshGroupType' type='button' id='btnRefreshGroupType' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblgrouplist_filter");
                            }

                        });
                        $('div.dataTables_filter input').addClass('form-control form-control-sm');

                    }
                });
              } 
              else {
                let data = JSON.parse(dataObject[0].data);

                console.log(data);
                let useData = data.tvs1tabgroups;           
                let records = [];
                let inventoryData = [];
                for (let i = 0; i < useData.length; i++) {
                    if (!isNaN(useData[i].fields.Description)) {
                        description = useData[i].fields.Description || '';
                    } else {
                        description = '';
                    }
                    var dataList = [
                        useData[i].fields.Description || '-',
                        useData[i].fields.ID || ''
                    ];                  
                    splashArrayGroupTypeList.push(dataList);
                   

                }
                if (splashArrayGroupTypeList) {

                    $('#tblgrouplist').dataTable({
                        data: splashArrayGroupTypeList,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        paging: true,
                        "aaSorting": [],
                        "orderMulti": true,
                        columnDefs: [
                            { className: "thgroupDescription", "targets": [0] },                                     
                            { className: "thgroupID hiddenColumn", "targets": [1] }                              
                        ],
                        colReorder: true,
                        "order": [
                            [0, "asc"]
                        ],
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "fnInitComplete": function () {
                           
                            $("<button class='btn btn-primary btnAddGroupType' data-dismiss='modal' data-toggle='modal' data-target='#addGroupModel' type='button' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblgrouplist_filter");
                            $("<button class='btn btn-primary btnRefreshGroupType' type='button' id='btnRefreshGroupType' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblgrouplist_filter");
                        }

                    });

                    $('div.dataTables_filter input').addClass('form-control form-control-sm');

                }
            }
        }).catch(function(err) {
            sideBarService.getNewGroupListVS1().then(function(data) {

                let records = [];
                let inventoryData = [];

                console.log(data);
                // for (let i = 0; i < data.tvs1tabgroups.length; i++) {
                //    if (!isNaN(data.tvs1tabgroups[i].fields.Description)) {
                //     Description = data.tvs1tabgroups[i].fields.Description || '';
                //   } else {
                //     Description = '';
                //   }
                //   var dataList = [
      
                //     data.tvs1tabgroups[i].fields.Description || '',          
                //     data.tvs1tabgroups[i].fields.ID || ''
                //   ];            
                //   splashArrayGroupTypeList.push(dataList);
                

                // }
                //localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayAccountList));

                if (splashArrayGroupTypeList) {

                    $('#tblratetypelist').dataTable({
                        data: splashArrayGroupTypeList,

                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        paging: true,
                        "aaSorting": [],
                        "orderMulti": true,
                        columnDefs: [
                            { className: "thDescription", "targets": [0] },                                     
                            { className: "thRateID hiddenColumn", "targets": [1]}   
                        ],
                        colReorder: true,

                        "order": [
                            [0, "asc"]
                        ],

                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "fnInitComplete": function () {
                           
                            $("<button class='btn btn-primary btnAddGroupType' data-dismiss='modal' data-toggle='modal' data-target='#addRateModel' type='button' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblgrouplist_filter");
                            $("<button class='btn btn-primary btnRefreshGroupType' type='button' id='btnRefreshGroupType' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblgrouplist_filter");
                        }

                    });

                     $('div.dataTables_filter input').addClass('form-control form-control-sm');

                }
            });
        });
    };
    tempObj.getAllGroupType();

});
Template.grouplist.helpers({
   
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function(a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },
  
   
    isMobileDevices: () => {
        var isMobile = false;

        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    },
   
});

Template.grouplist.events({
   
    'click .btnAddGroupType': function(event) {
      $('#add-group-title').text('Add New Group Type');
      $('#edtgroupID').val('');
   
    },


    'click .btnRefreshGroupType': function (event) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        const customerList = [];
        const clientList = [];
        let salesOrderTable;
        var splashArray = new Array();
        var splashArrayGroupTypeList = new Array(); 
        let utilityService = new UtilityService();
        const dataTableList = [];
        const tableHeaderList = [];
        let sideBarService = new SideBarService();
        let rateTypeService = new RateTypeService();
        let dataSearchName = $('#tblgrouplist_filter input').val();
        var currentLoc = FlowRouter.current().route.path;
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getGroupTypeByName(dataSearchName).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                if (data.tvs1tabgroups.length > 0) {
                  for (let i = 0; i < data.tvs1tabgroups.length; i++) {
                    var dataList = [                  
                    	data.tvs1tabgroups[i].fields.Description || '',
                        data.tvs1tabgroups[i].fields.ID || ''
                    ];
                
                    splashArrayGroupTypeList.push(dataList);
                    

                    }
                    var datatable = $('#tblgrouplist').DataTable();
                    datatable.clear();
                    datatable.rows.add(splashArrayGroupTypeList);
                    datatable.draw(false);

                    $('.fullScreenSpin').css('display', 'none');
                } else {

                    $('.fullScreenSpin').css('display', 'none');
                    $('#groupTypeListModel').modal('toggle');
                    swal({
                        title: 'Question',
                        text: "Group Type does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#addGroupModel').modal('toggle');
                            $('#edtgroupdescription').val(dataSearchName);
                        } else if (result.dismiss === 'cancel') {
                            $('#groupTypeListModel').modal('toggle');
                        }
                    });

                }

            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
          sideBarService.getNewGroupListVS1().then(function(data) {

                  let records = [];
                  let inventoryData = [];
                  for (let i = 0; i < data.tvs1tabgroups.length; i++) {
                      var dataList = [
                  
                          data.tvs1tabgroups[i].fields.Description || '',
                          data.tvs1tabgroups[i].fields.ID || ''
                      ];

                      splashArrayGroupTypeList.push(dataList);
                  }
                  
                  var datatable = $('#tblgrouplist').DataTable();
                    datatable.clear();
                    datatable.rows.add(splashArrayGroupTypeList);
                    datatable.draw(false);
                   $('.fullScreenSpin').css('display', 'none');
                   }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }
    },
    'keyup #tblgrouplist_filter input': function (event) {
      if (event.keyCode == 13) {
         $(".btnRefreshGroupType").trigger("click");
      }
    },
    'change #sltStatus': function () {
        let status = $('#sltStatus').find(":selected").val();
        if (status == "newstatus") {
            $('#statusModal').modal();
        }
    },
 
    'click .lineDescription': function(event) {
        $('#tblCreditLine tbody tr .lineDescription').attr("data-toggle", "modal");
        $('#tblCreditLine tbody tr .lineDescription').attr("data-target", "#groupTypeListModel");
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectLineID').val(targetID);

        setTimeout(function() {
            $('#tblgrouplist_filter .form-control-sm').focus();
        }, 500);
    },
    'click #groupTypeListModel #refreshpagelist': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        Meteor._reload.reload();
        templateObject.getAllGroupType();

    },
 

    
   
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});