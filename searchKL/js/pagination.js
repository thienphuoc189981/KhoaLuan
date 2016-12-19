var app = angular.module('myApp', ['ui.bootstrap']);

app.factory('Items', ['$http', function ($http) {
        return {
            checkCached : function(q) {
                return $http.get('http://localhost:1337/api/checkCached?q='+ q);
            },
            dbSearch : function(q) {
                return $http.get('http://localhost:1337/api/dbSearch?q='+ q);
            },
            indexVnTokenizer : function(json) {
                return $http.post('http://localhost:1337/api/vnTokenizer', json);
            },
            solrSearch : function(json,q) {
                return $http.post('http://localhost:1337/api/solrSearch?q='+q, json);
            },
            saveCache : function(json,q) {
                return $http.post('http://localhost:1337/api/saveCache?q='+q, json);
            }
        }
}]);

//------------------------------------Filter Data-----------------------------

//---------------filter Multiple location------------------------
app.filter('filterMultiple',['$filter',function ($filter) {
return function (items, keyObj) {
    var filterObj = {
        data:items,
        filteredData:[],
        applyFilter : function(obj,key){
            var fData = [];
            if (this.filteredData.length == 0)
                this.filteredData = this.data;
            if (obj){
                var fObj = {};
                if (!angular.isArray(obj)){
                    fObj[key] = obj;
                    fData = fData.concat($filter('filter')(this.filteredData,fObj));
                } else if (angular.isArray(obj)){
                    if (obj.length > 0){
                        for (var i=0;i<obj.length;i++){
                            if (angular.isDefined(obj[i])){
                                fObj[key] = obj[i];
                                fData = fData.concat($filter('filter')(this.filteredData,fObj));    
                            }
                        }

                    }
                }
                if (fData.length > 0){
                    this.filteredData = fData;
                }
            }
        }
    };
    if (keyObj){
        angular.forEach(keyObj,function(obj,key){
            filterObj.applyFilter(obj,key);
        });
    }
    return filterObj.filteredData;
}
}]);

//------------------------------ phan trang khi filter-------------
app.filter('page', function(){
  return function(input,begin){
    var end = begin + 8;
    return input.slice(begin,end);
  }
});

//-------------------------- filter Date----------------------------
app.filter('formatDate', function(){
  return function(input, key){
    var out = [];
    var threeDay = 3;
    var oneWeek  = 7;
    var numDay = 0;
    if(key == 1){
        numDay = threeDay;
    }else if(key == 2){
        numDay = oneWeek;
    }
    var currDate = new Date;
    var valueOfCeurrDate = currDate.valueOf();
    var month = (1 + currDate.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
    var day = currDate.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
    var DateFormat = day + '/' + month + '/' +   currDate.getFullYear();

    angular.forEach(input, function(language){

        dt = language.postDate;
        if(!(key) ||key == 0 && language.postDate.indexOf(DateFormat) >-1){
            out.push(language);
        }else if( key > 0){
            var date = new Date(dt.split('/')[1] +'-'+ dt.split('/')[0] +'-'+ dt.split('/')[2]);
            var dueTime = new Date(valueOfCeurrDate - numDay*86400000);
            if(parseInt(dueTime.valueOf()) <= parseInt(date.valueOf())){
                out.push(language);
            }
        }
    });
    return out;
  }
});

//--------------------------- get data unique location--------------
app.filter('uniq', function(){
  return function(input){
    var out = [];
    angular.forEach(input, function(language){
        var a = language.location;

      if(a.indexOf(',') == -1 && a.length > 1){
        out.push(language);
    }else if(a.indexOf(',') > -1 && a.length > 1){
        for(var i = 0;i< a.split(',').length;i++){
            language.location = a.split(',')[i].trim();
            console.log("cuc "+ language.location);
            out.push(language);
        }
    }
    });
    return out;
  }
});

//---------------------------- filter salary------------------------ 
app.filter('salaryFilter', function(){
  return function(input,key){
    var out = [];
    var value = "" ;
    var max = 0, min = 0;
    if(key == 0){
        value = "Cạnh tranh" ;
    }else if(key == 1){
        value = "Thương lượng" ;
    }else if(key == 2){
        max = 10 ;
        min = 0 ;

    }else if(key == 3){
        max = 25 ;
        min = 10 ;
    }else if(key == 4){
        max = 50 ;
        min = 25 ;
    }else if(key == 5){
        max = 500 ;
        min = 50 ;
    }

    angular.forEach(input, function(language){
        var salary = language.salary;
        var slmAX , slMin ; 

        if(!(key) || (key == 1 && salary.indexOf(value) > -1) || (key == 0 && salary.indexOf(value) > -1) ){
           out.push(language);
        }else if(key > 1 ){

            if(salary.indexOf('triệu') > -1){

                if(salary.indexOf('-') > -1){
                    slmAX = parseInt(salary.split('-')[1].replace(/triệu/g,''));
                slMin = parseInt(salary.split('-')[0].replace(/triệu/g,''));

                }
                

            }else if(salary.indexOf('USD') > -1){
                var a = "";
                if(salary.indexOf(',') > -1){
                    a = salary.replace(/,/g,'')
                }else{
                    a = salary ;
                }

                if(salary.indexOf('-') > -1){

                    slmAX = (parseInt(a.split('-')[1].replace(/USD/g,'')) * 22800) / 1000000;
                    slMin = (parseInt(a.split('-')[0].replace(/USD/g,'')) * 22800) / 1000000;

                }else if(a.indexOf('Hơn') > -1){
                    slmAX = (parseInt(a.replace(/USD/g,'').replace(/Hơn/g,'')) * 22800) / 1000000;
                    slMin = (parseInt(a.replace(/USD/g,'').replace(/Hơn/g,'')) * 22800) / 1000000;

                }else{
                    slmAX = (parseInt(a.replace(/USD/g,'')) * 22800) / 1000000;
                    slMin = (parseInt(a.replace(/USD/g,'')) * 22800) / 1000000;
                    
                }
            }

            if((key == 2  && max > slMin) || (key == 5 &&  slMin > min ) ){
                    out.push(language);
            }else if( 2 < key < 5 && ((max >= slMin )&& (slmAX >= min))){
                 out.push(language);
            }
        }
    });
    return out;
  }
});


app.controller('PageCtrl',['Items','$scope','filterFilter', function (Items,$scope,filterFilter) {   

    $scope.items = dataTest();   
    // $scope.todos = "cddddd";
    $scope.doSearch = function() {

        Items.checkCached($scope.formData.txtSearch)
            .success(function(data) {
              
                //$scope.todos = $scope.todos.status;
                if (data.status) {
                    var json = [];
                    for (var i = 0; i <data.doc.jobs.length; i++){
                        json.push(data.doc.jobs[i]);
                    };
                    $scope.todos = json;
                    // console.log(json);
                    // console.log("status true");
                    $scope.items = json;
                    $scope.totalItems = json.length;
                    // console.log(json.length)
                    $scope.pageCount = function () {
                        return Math.ceil($scope.totalItems / $scope.entryLimit);
                    };
                    var begin = (($scope.currentPage - 1) * $scope.entryLimit),
                    end = begin + $scope.entryLimit;
                    $scope.filtereditems = $scope.items.slice(begin, end);
                    //$scope.$digest();
                }else{


                    $scope.urlCareerbuilder = 'http://careerbuilder.vn/viec-lam/';
                    getcareerbuilder($scope.urlCareerbuilder,$scope.formData.txtSearch,function(rs){ 
                        var s =JSON.stringify(rs).replace(/\\n/g, "");
                        s=s.replace(/\\t/g, "");
                      
                        rs = JSON.parse(s);
                          // console.log(rs);
                    //xu ly search
                     var json = [];
                    Items.dbSearch($scope.formData.txtSearch)
                        .success(function(data) {
                            for (var i = 0; i <data.rows.length; i++){
                                json.push(data.rows[i].doc);
                            };

                            $scope.todos = json;
                            // console.log(json);

                            for (var i = 0; i <rs.length; i++){
                                    json.push(rs[i]);
                                };   


                                // call the create function from our service (returns a promise object)
                            Items.indexVnTokenizer(json)
                                .success(function(data) {
                                        // console.log(data.indexOf('\ "'));
                                    
                                    var dataParse = JSON.parse(data);
                                    // console.log("this is a: "+dataParse);

                                     Items.solrSearch(dataParse, $scope.formData.txtSearch)
                                        .success(function(result) {
                                            // result.push({"q" : $scope.formData.txtSearch})
                                            // console.log("this is solr " +result);
                                            result = JSON.stringify(result);
                                            // console.log("this is solr " +result);
                                            result = JSON.parse(result);
                                            // console.log(result);
                                            //prepare json
                                            result.forEach(function(rs){
                                                rs.title = rs.title[0].replace(/_/g,' ').replace(/" /g,'"').replace(/ "/g,'"');
                                                rs.description = rs.description[0].replace(/_/g,' ').replace(/" /g,'"').replace(/ "/g,'"');
                                                rs.location = rs.location[0].replace(/_/g,' ').replace(/" /g,'"').replace(/ "/g,'"');
                                                rs.company = rs.company[0].replace(/_/g,' ').replace(/" /g,'"').replace(/ "/g,'"');
                                                rs.salary = rs.salary[0].replace(/_/g,' ').replace(/" /g,'"').replace(/ "/g,'"');
                                                rs.link = rs.link[0].replace(/https : \/ \/ /g,'https://').replace(/http : \/ \/ /g,'http://').replace(/" /g,'"').replace(/ "/g,'"');
                                                // console.log(rs.title);
                                                // console.log(rs.link);
                                            });

                                           
                                            $scope.items = result;
                                            $scope.totalItems = result.length;
                                            // console.log(result.length)
                                            $scope.pageCount = function () {
                                                return Math.ceil($scope.totalItems / $scope.entryLimit);
                                            };
                                            var begin = (($scope.currentPage - 1) * $scope.entryLimit),
                                            end = begin + $scope.entryLimit;
                                            $scope.filtereditems = $scope.items.slice(begin, end);
                                            //$scope.$digest();
                                            Items.saveCache(result, $scope.formData.txtSearch)
                                                .success(function(data) {
                                                    console.log(data);
                                                });

                                    });
                                });


                        });

                    $scope.items = rs;
                    $scope.totalItems = $scope.items.length;
                    $scope.pageCount = function () {
                        return Math.ceil($scope.totalItems / $scope.entryLimit);
                    };
                    var begin = (($scope.currentPage - 1) * $scope.entryLimit),
                    end = begin + $scope.entryLimit;
                    $scope.filtereditems = $scope.items.slice(begin, end);
                    $scope.$digest();
                  });

                }
            });

      /*  $scope.urlCareerbuilder = 'http://careerbuilder.vn/viec-lam/';
         getcareerbuilder($scope.urlCareerbuilder,$scope.formData.txtSearch,function(rs){ 
            //xu ly search
            console.log(rs);
            $scope.items = rs;
            $scope.totalItems = $scope.items.length;
            $scope.pageCount = function () {
                return Math.ceil($scope.totalItems / $scope.entryLimit);
            };
            var begin = (($scope.currentPage - 1) * $scope.entryLimit),
            end = begin + $scope.entryLimit;
            $scope.filtereditems = $scope.items.slice(begin, end);
            $scope.$digest();
          });*/

    };
                    $scope.currentPage = 1;
                    $scope.totalItems = $scope.items.length;
                    $scope.entryLimit = 8; // items per page
                    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                    $scope.maxSize = 3;
            
                    $scope.pageCount = function () {
                        return Math.ceil($scope.totalItems / $scope.entryLimit);
                    };
                    // $watch search to update pagination
                    $scope.$watch('currentPage + itemsPerPage', function () {
                        var begin = (($scope.currentPage - 1) * $scope.entryLimit),
                            end = begin + $scope.entryLimit;
                
                        $scope.filtereditems = filterFilter($scope.items, begin);
                    });

     //   });
   
}]);

