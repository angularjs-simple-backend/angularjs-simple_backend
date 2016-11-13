myapp.controller('CommonController', function($scope, $routeParams,CommonFactory,$uibModal) {
    
  $scope.table = $routeParams.table;
  $scope.view = $routeParams.view;
  $scope.primary_key="id";
  $scope.tableconfig=[];
  $scope.items = [];
  $scope.currentPage = 1;
  $scope.totalItems  = 0;
  $scope.sort={};

  $scope.itemsPerPage=20;

   
   $scope.show = function() {
       
    };
	
   $scope.deleteItems = function() {
       var r = confirm("Do you want to delete this item!");
		if (r == true) {
			var deleteitems=[];
			var deleteindexitems=[];
					$('.row-item input:checked').each(function() {
				   
					  deleteitems.push($(this).val());
					  deleteindexitems.push($(this).attr("data-index"));
					   $(this).closest("li").hide();
				});
			
	        CommonFactory.deleteItems(deleteitems,$scope.table).success(function(data) {
				if (data=="Deleted") 
				{
				deleteindexitems.forEach(function(entry) {
				$scope.items.slice(parseInt(entry), 1);
				});
				
           	    }

			});

		} 
    };
	

	$scope.tableEdit = function() {
	$uibModal.open({
    animation: $scope.animationsEnabled,
    templateUrl: 'common/modal.config.view.html',
      controller: 'ModalConfigInstanceCtrl',
   
	  size: 'lg',
      resolve: {
        items: function () {
          return $scope.tableconfig
        },
		table: function () {
          return $scope.table
        },
		
      }
    }).result.then(function (saveditem) {
		$scope.tableconfig=saveditem;
    });
	
    }
//  change pager funtion

  
  $scope.pageChanged = function() {
	 
    CommonFactory.getList($scope.table,$scope.itemsPerPage,$scope.currentPage-1,$scope.sort).success(function(data) {
           if (data.success) {
                 $scope.items = data.data;
				 $scope.totalItems  = data.row_count;
				 $scope.sort=data.sort;
           	   }

        });
   
   
  };	
	
$scope.search = function(keyword)
{
	$scope.itemsPerPage=50
	 $scope.totalItems  = 49;
	$searchfields=[];
for (index = 0; index < $scope.tableconfig.length; ++index) {
	if ($scope.tableconfig[index].value)
	{
		if ($scope.tableconfig[index].value.search)
		$searchfields.push($scope.tableconfig[index].name)
	}
	
}
 if ($searchfields.length>0)
 {
  CommonFactory.getListByKeyword($scope.table,keyword,$searchfields,$scope.itemsPerPage,0,$scope.sort).success(function(data) {
           if (data.success) {
                 $scope.items = data.data;
				
				 
           	   }

        });	
 }
 else
 {
	alert("Need to config the search fields. In Config") ;
 }

}	
	
$scope.createItems = function()
{

//var item = angular.copy($scope.items[0]);  // have to create item if there is no item
//if (item)
//{
//for(var i in item) { item[i] = ""}
//}
//else
//{
	item={};

	for(var i in $scope.tableconfig) 
	{
		

	var key=$scope.tableconfig[i].name;
	item[key] = "";

	}
//}	

 var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
    templateUrl: 'common/modal.insert.view.html',
      controller: 'ModalInstanceCtrl',
   
	  size: 'lg',
      resolve: {
        item: function () {
          return item 
        },
		table: function () {
          return $scope.table
        },
		primarykey: function () {
          return $scope.primary_key
        },
		propeties: function () {
          return $scope.tableconfig
        },
		
      }
    }).result.then(function (saveditem) {     
		
			$scope.items.push(saveditem);
    });
		
}
	 $scope.$on('updateSort', function(event, args) {
        $scope.sort = args.sort;
	
		$scope.pageChanged();
		
    });

   function init() {
	  // console.log($scope.view);
        CommonFactory.getList($scope.table,$scope.itemsPerPage,0,$scope.sort,$scope.view).success(function(data) {
           if (data.success) {
				
                 $scope.items = data.data;
				 $scope.primary_key =data.key;
				 $scope.tableconfig=data.propeties;
				 $scope.viewconfig=data.view_propeties;
				 $scope.totalItems  = data.row_count;
				 $scope.sort.field=data.key;
				 $scope.sort.asc=false;
				 
           	   }

        });

	}
	 init();
	
  });
 

myapp.controller('CommonRowController', function($scope,$uibModal,$sce,CommonFactory) {
    
$scope.deleted=true;
$scope.getShow=function()
{
return $scope.deleted	;
}

$scope.selectAll =function($event)
{
	
$(".chk input:checkbox").prop('checked', $(this).prop("checked"));	
}
$scope.isSelectedAll = function() {

};


$scope.show_value = function(html_code,object,key) {
	var newvalue= show_data(object,html_code,key);
    return $sce.trustAsHtml(newvalue);
	
 // return html_code;
}

function renderhtmltemplate(object,template)
{
template=unescape(template);
for (x in object) {
	var find="$$"+x+"$$";
 template= template.replaceAll(find,object[x]);
}
return 	template;
	
}



String.prototype.replaceAll = function(search, replace) {
    if (replace === undefined) {
        return this.toString();
    }
    return this.split(search).join(replace);
}


function show_data(object,value,key)
{
	var objectFound= getvaluebykey($scope.propeties,key)
	var control="";
	var template="";
	var htmltemplate="";
	

	if (objectFound)
	{
		
		
		 if (objectFound.value)
		 {
			 if (objectFound.value.editform)
				{
					control=objectFound.value.editform.id;
					htmltemplate=objectFound.value.editform.htmltemplate;
				}
		 }
		
	}
	switch(control) {
			    case "html":
				template = renderhtmltemplate(object,htmltemplate);
				break;

		        default:
		      	template = value;
						}
	
	return template;
}

$scope.showTitle =function(key) 
{

	var s ="";
	if (key== $scope.sort.field)
	{
		s=($scope.sort.asc)?"<i class=\"fa fa-angle-up\" aria-hidden=\"true\"></i>":"<i class=\"fa fa-angle-down\" aria-hidden=\"true\"></i>";
	}
	
	var r=key;
	var objectFound= getvaluebykey($scope.propeties,key)
	if (objectFound.value)
	  r = (objectFound.value.title)?(objectFound.value.title):key;
	return s+r;	
}
$scope.sortBy =function(key) 
{


	if ( $scope.sort)
	{
	
			$scope.sort.asc=!$scope.sort.asc;
			$scope.sort.field=key;
		
	}
	else
	{
		var sort={field:key,asc:true};
		$scope.sort=sort;
		
	}	
	  $scope.$emit('updateSort', {sort:$scope.sort});
	  	
}


function getvaluebykey(array,key)
{
var elementPos = array.map(function(x) {return x.name; }).indexOf(key);
var objectFound = array[elementPos];	
return 	objectFound;
}

$scope.getStyle = function(key) {
	
	var objectFound= getvaluebykey($scope.propeties,key)
	if (objectFound.value)
	{
		
	  return (objectFound.value.width)?{"width":objectFound.value.width}:"";
	}
	else
	  return "";
}


$scope.Enable = function(key) {
	var objectFound= getvaluebykey($scope.propeties,key)
	
	if (objectFound.value)
	  return objectFound.value.enable;
	else
	return false;
}
$scope.getValue = function() {
return $scope.fields[$scope.primarykey];

}


$scope.setFilters = function (event) {
event.preventDefault();

}; 

$scope.viewDelete= function(item)
{
	var r = confirm("Do you want to delete this item!");
		if (r == true) {
			var deleteitems=[item[$scope.primarykey]];
			
		
	        CommonFactory.deleteItems(deleteitems,$scope.table).success(function(data) {
				if (data=="Deleted") 
				{
			
				 $scope.deleted=false;
			
           	    }

        });

		} 
		
	
}
 
$scope.viewEdit = function(item)
{

 var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
    templateUrl: 'common/modal.update.view.html',
      controller: 'ModalInstanceCtrl',
   
	  size: 'lg',
      resolve: {
        item: function () {
          return item
        },
		table: function () {
          return $scope.table
        },
		primarykey: function () {
          return $scope.primarykey
        },
		propeties: function () {
          return $scope.propeties
        },
		
		
      }
    }).result.then(function (saveditem) {     
		$scope.fields=saveditem;

    });
		
}

});

myapp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance,CommonFactory, item,table,primarykey,propeties) {


 $scope.loading=false;
  $scope.originalItems= item;
  $scope.items =angular.copy($scope.originalItems);
  $scope.table =table;
   $scope.propeties =propeties;
  $scope.primarykey =primarykey;


   $scope.checkDisable =function(key)
   {
	  
	   if (key==$scope.primarykey)
		   return true;
	   else
		   return false;
	   
   }
 $scope.save = function () {
	 $scope.loading=true;

	 CommonFactory.updateItem($scope.items,$scope.table).success(function(data) {
           if (data=="updated") {
				$scope.originalItems=$scope.items;
				  $uibModalInstance.close($scope.items);
           	   }
        });
	};
	 $scope.insert = function () {
	 $scope.loading=true;

	 CommonFactory.insertItem($scope.items,$scope.table).success(function(data) {
           if (data=="inserted") {
			
				  $uibModalInstance.close($scope.items);
           	   }
        });
	};
	
     $scope.cancel = function () {
   $uibModalInstance.dismiss('cancel');
	
  };
});

myapp.controller('ModalConfigInstanceCtrl', function ($scope,$uibModal, $uibModalInstance,SettingFactory, items,table) {
 $scope.loading=false;
 $scope.originalItems= items;
  $scope.items =angular.copy($scope.originalItems);
  $scope.table =table;
  $scope.listtable =[];
  $scope.fieldlist ={};
  

  $scope.options = [{id:"text",name:"text"},{id:"textarea",name:"textarea"},{id:"checkbox",name:"check box"},{id:"list",name:"list"},{id:"link",name:"link"},{id:"datetime",name:"datetime"},{id:"number",name:"number"},{id:"html",name:"html"}];
  function init()
  {
	  SettingFactory.getTable().success(function(data) {
           if (data.success) {
                 $scope.listtable = data.data;
               
           	   }

        });
	  
  }
  
  init()
  
 $scope.loadFields= function(tablename)
 {
	
     SettingFactory.getColumn(tablename).success(function(data) {
           if (data.success) {
                
                 $scope.fieldlist[tablename]=data.data;
           	   }

        });
		
 } 
 
 $scope.editHTML =function(encodehtml)
 {

	 var modalInstance = $uibModal.open({
      templateUrl: 'common/modal.edit_html_template.view.html',
      controller: 'ModaleditHtmlInstanceCtrl',
	   	  size: 'lg',
      resolve: {
        html: function () {
        	
          return encodehtml.htmltemplate
        },
		fields: function(){
			return $scope.items;
		},
	  }
    }).result.then(function (saveditem) {     
		
		
		encodehtml.htmltemplate=saveditem;
    }); 
	 
 } 

 $scope.save = function () {  
		$scope.loading=true;
         SettingFactory.saveColumn($scope.table,$scope.items).success(function(data) {
           if (data=="saved") {
				$scope.originalItems=$scope.items;
				 $uibModalInstance.close($scope.items);
           	   }
        });
	
	};
  $scope.cancel = function () {

   $uibModalInstance.dismiss('cancel');
	
  };
});
myapp.controller('ModaleditHtmlInstanceCtrl', function ($scope, $uibModalInstance,html,fields) {
			$scope.encode_html=unescape(html)
			$scope.fields=fields;
			
			 $scope.save = function () {
			 	

				  $uibModalInstance.close(escape($scope.encode_html));
				};

				 $scope.cancel = function () {
			       $uibModalInstance.dismiss('cancel');
				 };
				  $scope.insert_field_name = function (areaid,text) {
				  $scope.encode_html=insertAtCaret(areaid,"$$"+text+"$$");
				 
				  };
				 
				 
//  add text at cursor pointer
function insertAtCaret(areaId,text) {
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? 
        "ff" : (document.selection ? "ie" : false ) );
    if (br == "ie") { 
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        strPos = range.text.length;
    }
    else if (br == "ff") strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0,strPos);  
    var back = (txtarea.value).substring(strPos,txtarea.value.length); 
    txtarea.value=front+text+back;
    strPos = strPos + text.length;
    if (br == "ie") { 
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        range.moveStart ('character', strPos);
        range.moveEnd ('character', 0);
        range.select();
    }
    else if (br == "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }
    txtarea.scrollTop = scrollPos;
    return txtarea.value;
}
//end 				 
				 
});
