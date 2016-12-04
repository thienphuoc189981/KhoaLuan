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
            }
        }
}]);

app.controller('PageCtrl',['Items','$scope', function (Items,$scope) {   

    $scope.items = dataTest();   
    $scope.todos = "cddddd";
    $scope.doSearch = function() {

        Items.checkCached($scope.formData.txtSearch)
            .success(function(data) {
              
                //$scope.todos = $scope.todos.status;
                if (data.status) {
                    var json = [];
                    for (var i = 0; i <data.rows.length; i++){
                        json.push(data.rows[i].doc);
                    };
                    $scope.todos = json;
                    console.log(json);
                    console.log("status true");
                    $scope.items = json;
                    $scope.totalItems = json.length;
                    console.log(json.length)
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
                            console.log(json);

                            for (var i = 0; i <rs.length; i++){
                                    json.push(rs[i]);
                                };   


                                // call the create function from our service (returns a promise object)
                            Items.indexVnTokenizer(json)
                                .success(function(data) {

                                    // console.log(data);
                                    var a = JSON.parse(data);
                                    // console.log("this is a: "+a);

                                     Items.solrSearch(a,$scope.formData.txtSearch)
                                        .success(function(result) {
                                            // result.push({"q" : $scope.formData.txtSearch})
                                            console.log("this is solr " +result);
                                            result = JSON.stringify(result);
                                            result.replaceAll(/_/gi," ");
                                            console.log("this is solr " +result);
                                            result = JSON.parse(result);
                                            console.log(result);

                                            $scope.items = result;
                                            $scope.totalItems = result.length;
                                            console.log(result.length)
                                            $scope.pageCount = function () {
                                                return Math.ceil($scope.totalItems / $scope.entryLimit);
                                            };
                                            var begin = (($scope.currentPage - 1) * $scope.entryLimit),
                                            end = begin + $scope.entryLimit;
                                            $scope.filtereditems = $scope.items.slice(begin, end);
                                            //$scope.$digest();

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
                
                        $scope.filtereditems = $scope.items.slice(begin, end);
                    });

     //   });
   
}]);

//------------------------------------java script-----------------------------

function getcareerbuilder(url,kw,callback)
{
    //alert(url);
    var rs = [];

   AcrawlByXMLHttpRequest(url + kw.replace(/ /g, '-')+ '-k-vi.html', function(hmtlString) {
        AhtmlParser(hmtlString, 'dd.brief').each(function(i, jobs) {
            var datetime, title, city, description, link, company, id;
            city = $('span.location',jobs).text();
            title = $('a.job',jobs).text();
            link = $('a.job',jobs).attr('href');
            datetime = $('p.dateposted',jobs).text();
            description = $('p.rc_jobDescription',jobs).text();
            company = $('span.location',jobs).text();
            id = Math.floor((Math.random() * 10000000000));

            if (!$('img', jobs).attr('src')) {
                img = "images/no-img.png";
            } else {
                img = 'http://careerbuilder.vn'+$('img', jobs).attr('src');
            }
            var date = datetime.split("Dăng tuyển: ");
            var json = {
                _id:id,
                datetime : datetime,
                title : title, 
                location : city, 
                description : description, 
                link : link,
                company : company,
                image : img,
                salary : 'select to view'
            };
            rs.push(json);
        })
        callback(rs);
    });
    
};

function AcrawlByXMLHttpRequest(url, fn) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            fn(this.responseText);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
};

function AhtmlParser(htmlString, classElement) {
    // jquery
    var $element = $('<div></div>');
    $element.html(htmlString);
    var DOM = $(classElement, $element);
    return DOM;
};

function b()
{
     var rs = [];
    var json = {
                datetime : "datetime",
                title : "title", 
                location : "city", 
                description : "description", 
                link : "link",
                company : "company",
                image : "img",
                salary : 'select to view'
            };
      var json2 = {
                datetime : "datetime",
                title : "heeee", 
                location : "city", 
                description : "description", 
                link : "link",
                company : "company",
                image : "img",
                salary : 'select to view'
            };       
    rs.push(json);
    rs.push(json2);
    console.log(rs);
            return rs;
}